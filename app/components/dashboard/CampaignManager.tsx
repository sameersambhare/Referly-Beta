"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Campaign } from '@/types/api';

export function CampaignManager() {
  const { data: session } = useSession();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        // Log session data for debugging
        console.log("Session data:", session);
        
        // Get businessId from session if available
        const businessId = session?.user?.id;
        const url = businessId ? `/api/campaigns?businessId=${businessId}` : "/api/campaigns";
        
        console.log("Fetching campaigns from:", url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error("Failed to fetch campaigns");
        }
        
        const data = await response.json();
        console.log("Fetched campaigns:", data);
        setCampaigns(data);
        setFilteredCampaigns(data);
      } catch (error) {
        setError("Error loading campaigns");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCampaigns();
  }, [session]);

  useEffect(() => {
    let filtered = campaigns;
    
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        campaign =>
          campaign.name.toLowerCase().includes(term) ||
          (campaign.description && campaign.description.toLowerCase().includes(term))
      );
    }
    
    if (activeTab === "active") {
      filtered = filtered.filter(campaign => campaign.isActive);
    } else if (activeTab === "inactive") {
      filtered = filtered.filter(campaign => !campaign.isActive);
    }
    
    setFilteredCampaigns(filtered);
  }, [searchTerm, activeTab, campaigns]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/15 p-4 rounded-md text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Button asChild>
          <Link href="/campaigns/new">Create Campaign</Link>
        </Button>
      </div>
      
      <div className="mb-6">
        <Input
          placeholder="Search campaigns..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab}>
          {filteredCampaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No campaigns found</p>
              <Button asChild className="mt-4">
                <Link href="/campaigns/new">Create Your First Campaign</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {filteredCampaigns.map((campaign) => (
                <Card key={campaign._id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{campaign.name}</CardTitle>
                        <CardDescription>
                          {campaign.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          campaign.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {campaign.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/campaigns/${campaign._id}`}>View</Link>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Start Date</p>
                        <p>{new Date(campaign.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">End Date</p>
                        <p>{campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'No end date'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Reward</p>
                        <p>
                          {campaign.rewardType}: ${campaign.rewardAmount}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Performance</p>
                        <p>{campaign.referralCount} referrals, {campaign.conversionCount} conversions</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 