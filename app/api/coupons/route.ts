import { NextResponse } from "next/server";
import axios from "axios";

// Cache mechanism to avoid excessive API calls
let couponsCache: any = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

// Define the expected coupon structure
interface Coupon {
  id: string;
  title: string;
  description: string;
  category: string;
  code: string;
  expiryDate: string;
  discount: string;
}

// Mock data for testing or when API is unavailable
const mockCoupons: Coupon[] = [
  {
    id: "coupon-001",
    title: "20% Off Your First Purchase",
    description: "Get 20% off your first purchase at any participating store",
    category: "Retail",
    code: "FIRST20",
    expiryDate: "2023-12-31",
    discount: "20%"
  },
  {
    id: "coupon-002",
    title: "Free Shipping",
    description: "Free shipping on all orders over $50",
    category: "E-commerce",
    code: "FREESHIP50",
    expiryDate: "2023-11-30",
    discount: "Free Shipping"
  },
  {
    id: "coupon-003",
    title: "$10 Off Your Next Order",
    description: "Get $10 off your next order of $100 or more",
    category: "Food & Dining",
    code: "SAVE10",
    expiryDate: "2023-10-15",
    discount: "$10"
  },
  {
    id: "coupon-004",
    title: "Buy One Get One Free",
    description: "Buy one item and get another of equal or lesser value for free",
    category: "Retail",
    code: "BOGOF2023",
    expiryDate: "2023-09-30",
    discount: "BOGO"
  },
  {
    id: "coupon-005",
    title: "30% Off Selected Items",
    description: "Get 30% off selected items in our summer collection",
    category: "Fashion",
    code: "SUMMER30",
    expiryDate: "2023-08-31",
    discount: "30%"
  }
];

// Helper function to ensure coupons data is always an array
function ensureCouponsArray(data: any): Coupon[] {
  console.log("API Response Structure:", JSON.stringify(data, null, 2));
  
  if (!data) return [];
  if (Array.isArray(data)) {
    // Map the array to ensure it matches our Coupon interface
    return data.map((item: any, index: number) => ({
      id: item.id?.toString() || `generated-${index}`,
      title: item.title || item.name || `Coupon ${index + 1}`,
      description: item.description || item.desc || '',
      category: item.category || item.type || 'General',
      code: item.code || item.couponCode || `CODE${index}`,
      expiryDate: item.expiryDate || item.expiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      discount: item.discount || item.value || 'Special Offer'
    }));
  }
  
  // If data is an object with a coupons property that's an array
  if (data.coupons && Array.isArray(data.coupons)) {
    return ensureCouponsArray(data.coupons);
  }
  
  // If data is an object but not in the expected format, try to extract values
  if (typeof data === 'object' && data !== null) {
    const values = Object.values(data);
    if (values.length > 0) {
      // Check if values are objects that look like coupons
      if (values.every(v => typeof v === 'object' && v !== null)) {
        return values.map((item: any, index: number) => ({
          id: item.id?.toString() || `generated-${index}`,
          title: item.title || item.name || `Coupon ${index + 1}`,
          description: item.description || item.desc || '',
          category: item.category || item.type || 'General',
          code: item.code || item.couponCode || `CODE${index}`,
          expiryDate: item.expiryDate || item.expiry || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          discount: item.discount || item.value || 'Special Offer'
        }));
      }
      
      // If values don't look like coupons, try to convert them
      return values.map((item: any, index: number) => {
        if (typeof item === 'object' && item !== null) {
          return {
            id: `generated-${index}`,
            title: `Coupon ${index + 1}`,
            description: JSON.stringify(item),
            category: 'General',
            code: `CODE${index}`,
            expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            discount: 'Special Offer'
          };
        }
        return {
          id: `generated-${index}`,
          title: `Coupon ${index + 1}`,
          description: String(item),
          category: 'General',
          code: `CODE${index}`,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          discount: 'Special Offer'
        };
      });
    }
  }
  
  // Fallback to mock data if we can't parse the response
  console.warn("Could not parse API response, using mock data");
  return mockCoupons;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "";
    const limit = searchParams.get("limit") || "10";
    
    // Check if we have a valid cache
    const now = Date.now();
    if (couponsCache && (now - lastFetchTime < CACHE_DURATION)) {
      // Filter cached coupons if category is specified
      if (category && couponsCache.length > 0) {
        const filteredCoupons = ensureCouponsArray(couponsCache).filter((coupon: Coupon) => 
          coupon.category?.toLowerCase().includes(category.toLowerCase())
        );
        return NextResponse.json({ 
          coupons: filteredCoupons.slice(0, parseInt(limit)),
          source: "cache"
        });
      }
      
      // Return cached coupons with limit
      return NextResponse.json({ 
        coupons: ensureCouponsArray(couponsCache).slice(0, parseInt(limit)),
        source: "cache"
      });
    }
    
    try {
      // Fetch fresh data from the API
      const options = {
        method: 'GET',
        url: 'https://27coupons.p.rapidapi.com/coupons/latest/',
        headers: {
          'x-rapidapi-key': process.env.RAPID_API_KEY,
          'x-rapidapi-host': '27coupons.p.rapidapi.com'
        }
      };
      
      const response = await axios.request(options);
      
      // Ensure response data is an array
      const couponsData = ensureCouponsArray(response.data);
      
      // Update cache
      couponsCache = couponsData;
      lastFetchTime = now;
      
      // Filter by category if specified
      let result = couponsData;
      if (category && result.length > 0) {
        result = result.filter((coupon: Coupon) => 
          coupon.category?.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      return NextResponse.json({ 
        coupons: result.slice(0, parseInt(limit)),
        source: "api"
      });
    } catch (apiError) {
      console.warn("API request failed, using mock data:", apiError);
      
      // Use mock data if API request fails
      let result = mockCoupons;
      if (category) {
        result = mockCoupons.filter(coupon => 
          coupon.category.toLowerCase().includes(category.toLowerCase())
        );
      }
      
      return NextResponse.json({ 
        coupons: result.slice(0, parseInt(limit)),
        source: "mock"
      });
    }
    
  } catch (error: any) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { 
        error: "Failed to fetch coupons", 
        details: error.message 
      },
      { status: 500 }
    );
  }
} 