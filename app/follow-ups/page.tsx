"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/components/ui/card"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"

interface FollowUp {
  _id: string;
  type: 'email' | 'sms' | 'call' | 'meeting';
  status: 'scheduled' | 'completed' | 'cancelled';
  scheduledDate: string;
  completedDate?: string;
  notes?: string;
  message?: string;
  isAutomated: boolean;
  createdAt: string;
  updatedAt: string;
  referralId?: {
    _id: string;
    referredPersonName: string;
    referredPersonEmail: string;
  };
  customerId?: {
    _id: string;
    name: string;
    email: string;
  };
}

export default function FollowUpsPage() {
  const { data: session, status } = useSession()
  const [followUps, setFollowUps] = useState<FollowUp[]>([])
  const [filteredFollowUps, setFilteredFollowUps] = useState<FollowUp[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  
  useEffect(() => {
    const fetchFollowUps = async () => {
      if (status === "authenticated") {
        try {
          const response = await fetch("/api/follow-ups")
          
          if (!response.ok) {
            throw new Error("Failed to fetch follow-ups")
          }
          
          const data = await response.json()
          setFollowUps(data)
          setFilteredFollowUps(data)
        } catch (error) {
          setError("Error loading follow-ups")
          console.error(error)
        } finally {
          setIsLoading(false)
        }
      }
    }
    
    fetchFollowUps()
  }, [status])
  
  useEffect(() => {
    // Filter follow-ups based on search term and active tab
    let filtered = followUps
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        followUp =>
          (followUp.referralId?.referredPersonName && followUp.referralId.referredPersonName.toLowerCase().includes(term)) ||
          (followUp.referralId?.referredPersonEmail && followUp.referralId.referredPersonEmail.toLowerCase().includes(term)) ||
          (followUp.customerId?.name && followUp.customerId.name.toLowerCase().includes(term)) ||
          (followUp.customerId?.email && followUp.customerId.email.toLowerCase().includes(term)) ||
          (followUp.notes && followUp.notes.toLowerCase().includes(term)) ||
          (followUp.message && followUp.message.toLowerCase().includes(term))
      )
    }
    
    // Filter by status
    if (activeTab !== "all") {
      filtered = filtered.filter(followUp => followUp.status === activeTab)
    }
    
    setFilteredFollowUps(filtered)
  }, [searchTerm, activeTab, followUps])
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }
  
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  }
  
  const getFollowUpTypeIcon = (type: string) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'sms':
        return '📱';
      case 'call':
        return '📞';
      case 'meeting':
        return '🤝';
      default:
        return '📅';
    }
  }
  
  const handleMarkComplete = async (id: string) => {
    try {
      const response = await fetch(`/api/follow-ups/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'completed',
          completedDate: new Date().toISOString(),
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update follow-up');
      }
      
      // Update the local state
      setFollowUps(prevFollowUps => 
        prevFollowUps.map(followUp => 
          followUp._id === id 
            ? { ...followUp, status: 'completed', completedDate: new Date().toISOString() } 
            : followUp
        )
      );
    } catch (error) {
      console.error('Error updating follow-up:', error);
    }
  };
  
  if (status === "loading" || isLoading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Follow-ups</h1>
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
        <h1 className="text-3xl font-bold mb-6">Follow-ups</h1>
        <div className="bg-destructive/15 p-4 rounded-md text-destructive">
          {error}
        </div>
      </div>
    )
  }
  
  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Follow-ups</h1>
        <Link href="/follow-ups/new">
          <Button>Schedule Follow-up</Button>
        </Link>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search follow-ups..."
          value={searchTerm}
          onChange={handleSearch}
          className="max-w-md"
        />
      </div>
      
      <Tabs defaultValue="all" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredFollowUps.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No follow-ups found</p>
              <Link href="/follow-ups/new">
                <Button className="mt-4">Schedule Your First Follow-up</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredFollowUps.map((followUp) => (
                <Card key={followUp._id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <span>{getFollowUpTypeIcon(followUp.type)}</span>
                          {followUp.customerId ? followUp.customerId.name : followUp.referralId?.referredPersonName}
                        </CardTitle>
                        <CardDescription>
                          {followUp.customerId ? followUp.customerId.email : followUp.referralId?.referredPersonEmail}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          followUp.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                          followUp.status === 'completed' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {followUp.status.charAt(0).toUpperCase() + followUp.status.slice(1)}
                        </span>
                        <Link href={`/follow-ups/${followUp._id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="capitalize">{followUp.type}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Scheduled Date</p>
                        <p>{formatDate(followUp.scheduledDate)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Completed Date</p>
                        <p>{followUp.completedDate ? formatDate(followUp.completedDate) : 'Not completed'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Automated</p>
                        <p>{followUp.isAutomated ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                    {followUp.notes && (
                      <div className="mt-4">
                        <p className="text-muted-foreground">Notes</p>
                        <p className="text-sm">{followUp.notes}</p>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    {followUp.status === 'scheduled' && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMarkComplete(followUp._id)}
                        >
                          Mark as Completed
                        </Button>
                        <Link href={`/follow-ups/${followUp._id}/edit`}>
                          <Button size="sm">Edit</Button>
                        </Link>
                      </>
                    )}
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