import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/app/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface Coupon {
  id: string;
  title: string;
  description: string;
  category: string;
  code: string;
  expiryDate: string;
  discount: string;
}

export function CouponRewards() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async (forceRefresh = false) => {
    try {
      if (!loading) setRefreshing(true);
      else setLoading(true);
      
      // Add a cache-busting parameter if forcing a refresh
      const url = forceRefresh 
        ? `/api/coupons?limit=5&t=${Date.now()}` 
        : '/api/coupons?limit=5';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Ensure coupons is an array
      if (!data.coupons || !Array.isArray(data.coupons)) {
        console.error('Invalid coupons data:', data);
        throw new Error('Invalid response format from API');
      }
      
      setCoupons(data.coupons);
      setError(null);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching coupons:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full h-[400px]">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-destructive mb-4">Error loading coupons: {error}</p>
            <Button onClick={() => fetchCoupons(true)} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>Available Rewards</CardTitle>
          <CardDescription>
            Select a coupon to reward your referrers
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => fetchCoupons(true)} 
          disabled={refreshing}
          title="Refresh coupons"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </CardHeader>
      <CardContent>
        {coupons.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No coupons available at the moment.</p>
            <Button onClick={() => fetchCoupons(true)} variant="outline" className="mt-4">
              Refresh
            </Button>
          </div>
        ) : (
          <div className="grid gap-4">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="flex flex-col space-y-2 p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{coupon.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {coupon.description}
                    </p>
                  </div>
                  {coupon.category && (
                    <Badge variant="secondary">{coupon.category}</Badge>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm">
                  <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm">
                    {coupon.code}
                  </code>
                  <span className="text-muted-foreground">
                    Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm font-medium">
                    Discount: {coupon.discount}
                  </span>
                  <Button size="sm">Select Reward</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 