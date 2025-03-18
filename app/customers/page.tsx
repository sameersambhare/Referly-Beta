"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

interface Customer {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  tags?: string[];
  status: 'active' | 'inactive' | 'lead';
  lastContactedAt?: string;
  createdAt: string;
  updatedAt: string;
  role: 'customer' | 'referrer';
  referralStats?: {
    totalReferrals: number;
    successfulReferrals: number;
    conversionRate: number;
  };
  rewardStats?: {
    totalRewards: number;
    totalValue: number;
  };
}

export default function CustomersPage() {
  const { data: session, status } = useSession()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [activeType, setActiveType] = useState<'all' | 'customer' | 'referrer'>('all')
  
  useEffect(() => {
    const fetchCustomers = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/customers")
          
          if (!response.ok) {
            throw new Error("Failed to fetch customers")
          }
          
          const data = await response.json()
          setCustomers(data)
          setFilteredCustomers(data)
        } catch (error) {
          setError("Error loading customers")
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    fetchCustomers()
  }, [status])
  
  useEffect(() => {
    // Filter customers based on search term, active tab and type
    let filtered = customers
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        customer =>
          customer.name.toLowerCase().includes(term) ||
          customer.email.toLowerCase().includes(term) ||
          (customer.phone && customer.phone.toLowerCase().includes(term)) ||
          (customer.notes && customer.notes.toLowerCase().includes(term)) ||
          (customer.tags && customer.tags.some(tag => tag.toLowerCase().includes(term)))
      )
    }
    
    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter(customer => customer.status === activeTab)
    }
    
    // Filter by type (customer/referrer)
    if (activeType !== "all") {
      filtered = filtered.filter(customer => customer.role === activeType)
    }
    
    setFilteredCustomers(filtered)
  }, [searchTerm, activeTab, activeType, customers])
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }
  
  const handleTypeChange = (value: 'all' | 'customer' | 'referrer') => {
    setActiveType(value)
  }
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString();
  }
  
  if (status === "loading" || isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Customers</h1>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }
  
  if (error) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Customers</h1>
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          {error}
        </div>
      </div>
    )
  }
  
  // Function to render the appropriate status badge
  const renderStatusBadge = (customer: Customer) => {
    let color = ''
    
    if (customer.status === 'active') {
      color = 'bg-green-100 text-green-800'
    } else if (customer.status === 'inactive') {
      color = 'bg-red-100 text-red-800'
    } else {
      color = 'bg-yellow-100 text-yellow-800'
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${color}`}>
        {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
      </span>
    )
  }
  
  const renderRoleBadge = (role: string) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${
        role === 'referrer' 
          ? 'bg-blue-100 text-blue-800' 
          : 'bg-purple-100 text-purple-800'
      }`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers & Referrers</h1>
        <div className="flex gap-2">
          <Link href="/customers/import">
            <Button variant="outline">Import Customers</Button>
          </Link>
          <Link href="/customers/new">
            <Button>Add Customer</Button>
          </Link>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={handleSearch}
          className="md:max-w-md"
        />
        
        <div className="flex gap-2">
          <Tabs defaultValue="all" onValueChange={(value) => handleTypeChange(value as any)} className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="customer">Customers</TabsTrigger>
              <TabsTrigger value="referrer">Referrers</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Status</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
          <TabsTrigger value="lead">Leads</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No customers found</p>
              <Link href="/customers/new">
                <Button className="mt-4">Add Your First Customer</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle>{customer.name}</CardTitle>
                          {renderRoleBadge(customer.role)}
                        </div>
                        <CardDescription>
                          {customer.email} • {customer.phone || "No phone"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {renderStatusBadge(customer)}
                        <Link href={`/customers/${customer._id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Last Contacted</p>
                        <p>{formatDate(customer.lastContactedAt)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Added On</p>
                        <p>{formatDate(customer.createdAt)}</p>
                      </div>
                      
                      {customer.role === 'referrer' && customer.referralStats ? (
                        <div>
                          <p className="text-muted-foreground">Referral Stats</p>
                          <p>
                            {customer.referralStats.successfulReferrals} / {customer.referralStats.totalReferrals} 
                            {' '}({customer.referralStats.conversionRate}%)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-muted-foreground">Rewards</p>
                          <p>
                            {customer.rewardStats?.totalRewards || 0} rewards
                            {customer.rewardStats?.totalValue ? ` ($${customer.rewardStats.totalValue})` : ''}
                          </p>
                        </div>
                      )}
                      
                      <div className="col-span-1 md:col-span-1">
                        <p className="text-muted-foreground">Tags</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {customer.tags && customer.tags.length > 0 ? (
                            customer.tags.map((tag, index) => (
                              <span 
                                key={index}
                                className="px-2 py-1 bg-secondary text-secondary-foreground rounded-full text-xs"
                              >
                                {tag}
                              </span>
                            ))
                          ) : (
                            <span className="text-muted-foreground">No tags</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <div>
                      {customer.notes && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium mr-1">Notes:</span>
                          {customer.notes.length > 80 
                            ? customer.notes.substring(0, 80) + "..." 
                            : customer.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      {customer.role === 'referrer' ? (
                        <Link href={`/customers/${customer._id}/campaigns`}>
                          <Button variant="outline" size="sm">View Campaigns</Button>
                        </Link>
                      ) : (
                        <Link href={`/follow-ups/new?customerId=${customer._id}`}>
                          <Button variant="outline" size="sm">Schedule Follow-up</Button>
                        </Link>
                      )}
                      <Link href={`/customers/${customer._id}/edit`}>
                        <Button size="sm">Edit</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
} 