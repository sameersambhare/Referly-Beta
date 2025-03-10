import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { DatePicker } from "@/app/components/ui/date-picker";
import { CouponRewards } from "@/app/components/dashboard/CouponRewards";
import { Badge } from "@/app/components/ui/badge";
import { Save, Plus, Trash2, Link, Copy, Check } from "lucide-react";

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'draft' | 'completed' | 'paused';
  startDate: Date;
  endDate?: Date;
  rewardType: 'discount' | 'payout' | 'coupon';
  rewardValue: string;
  rewardDetails: string;
  conversionRequirement: number;
  autoReward: boolean;
}

export function CampaignManager() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'campaign-001',
      name: 'Summer Referral Program',
      description: 'Refer friends and family for our summer promotion',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      rewardType: 'discount',
      rewardValue: '20%',
      rewardDetails: '20% off next purchase',
      conversionRequirement: 1,
      autoReward: true
    },
    {
      id: 'campaign-002',
      name: 'Customer Loyalty Program',
      description: 'Earn cash rewards for referring new customers',
      status: 'draft',
      startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      rewardType: 'payout',
      rewardValue: '$25',
      rewardDetails: '$25 cash reward per successful referral',
      conversionRequirement: 1,
      autoReward: true
    }
  ]);
  
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // New campaign form state
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    status: 'draft',
    startDate: new Date(),
    rewardType: 'discount',
    rewardValue: '',
    rewardDetails: '',
    conversionRequirement: 1,
    autoReward: true
  });
  
  const handleCreateCampaign = () => {
    const campaign: Campaign = {
      id: `campaign-${Date.now()}`,
      name: newCampaign.name || 'Untitled Campaign',
      description: newCampaign.description || '',
      status: newCampaign.status as 'active' | 'draft' | 'paused' | 'completed' || 'draft',
      startDate: newCampaign.startDate || new Date(),
      endDate: newCampaign.endDate,
      rewardType: newCampaign.rewardType as 'discount' | 'payout' | 'coupon' || 'discount',
      rewardValue: newCampaign.rewardValue || '0',
      rewardDetails: newCampaign.rewardDetails || '',
      conversionRequirement: newCampaign.conversionRequirement || 1,
      autoReward: newCampaign.autoReward || false
    };
    
    setCampaigns([...campaigns, campaign]);
    setNewCampaign({
      name: '',
      description: '',
      status: 'draft',
      startDate: new Date(),
      rewardType: 'discount',
      rewardValue: '',
      rewardDetails: '',
      conversionRequirement: 1,
      autoReward: true
    });
  };
  
  const handleUpdateCampaign = (updatedCampaign: Campaign) => {
    setCampaigns(campaigns.map(c => c.id === updatedCampaign.id ? updatedCampaign : c));
    setActiveCampaign(null);
    setIsEditing(false);
  };
  
  const handleDeleteCampaign = (id: string) => {
    setCampaigns(campaigns.filter(c => c.id !== id));
    if (activeCampaign?.id === id) {
      setActiveCampaign(null);
      setIsEditing(false);
    }
  };
  
  const handleCopyLink = () => {
    // In a real app, this would copy the actual referral link
    navigator.clipboard.writeText(`https://referly.com/r/${activeCampaign?.id}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      case 'paused':
        return <Badge className="bg-yellow-500">Paused</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <div className="space-y-6">
      <Tabs defaultValue="campaigns" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create Campaign</TabsTrigger>
          <TabsTrigger value="rewards">Reward Options</TabsTrigger>
        </TabsList>
        
        <TabsContent value="campaigns" className="space-y-4 mt-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="cursor-pointer hover:bg-accent/50 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    {getStatusBadge(campaign.status)}
                  </div>
                  <CardDescription>{campaign.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Start Date:</span>
                      <span>{campaign.startDate.toLocaleDateString()}</span>
                    </div>
                    {campaign.endDate && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">End Date:</span>
                        <span>{campaign.endDate.toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reward Type:</span>
                      <span className="capitalize">{campaign.rewardType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Reward Value:</span>
                      <span>{campaign.rewardValue}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setActiveCampaign(campaign);
                      setIsEditing(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setActiveCampaign(campaign)}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {activeCampaign && !isEditing && (
            <Card className="mt-6">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>{activeCampaign.name}</CardTitle>
                    <CardDescription>{activeCampaign.description}</CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setIsEditing(true)}
                    >
                      Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDeleteCampaign(activeCampaign.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Campaign Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <span>{getStatusBadge(activeCampaign.status)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span>{activeCampaign.startDate.toLocaleDateString()}</span>
                      </div>
                      {activeCampaign.endDate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">End Date:</span>
                          <span>{activeCampaign.endDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium mb-2">Reward Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reward Type:</span>
                        <span className="capitalize">{activeCampaign.rewardType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Reward Value:</span>
                        <span>{activeCampaign.rewardValue}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Conversions Required:</span>
                        <span>{activeCampaign.conversionRequirement}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Auto Reward:</span>
                        <span>{activeCampaign.autoReward ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Reward Description</h3>
                  <p className="text-sm">{activeCampaign.rewardDetails}</p>
                </div>
                
                <div className="pt-4">
                  <h3 className="text-sm font-medium mb-2">Referral Link</h3>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 p-2 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                      https://referly.com/r/{activeCampaign.id}
                    </div>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={handleCopyLink}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {isEditing && activeCampaign && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Edit Campaign</CardTitle>
                <CardDescription>Update your campaign details and rewards</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-name">Campaign Name</Label>
                      <Input 
                        id="edit-name" 
                        value={activeCampaign.name}
                        onChange={(e) => setActiveCampaign({...activeCampaign, name: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-description">Description</Label>
                      <Textarea 
                        id="edit-description" 
                        value={activeCampaign.description}
                        onChange={(e) => setActiveCampaign({...activeCampaign, description: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-status">Status</Label>
                      <Select 
                        value={activeCampaign.status}
                        onValueChange={(value) => setActiveCampaign({
                          ...activeCampaign, 
                          status: value as 'active' | 'draft' | 'completed' | 'paused'
                        })}
                      >
                        <SelectTrigger id="edit-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="paused">Paused</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-start-date">Start Date</Label>
                        <DatePicker
                          id="edit-start-date"
                          date={activeCampaign.startDate}
                          setDate={(date) => setActiveCampaign({...activeCampaign, startDate: date || new Date()})}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-end-date">End Date (Optional)</Label>
                        <DatePicker
                          id="edit-end-date"
                          date={activeCampaign.endDate}
                          setDate={(date) => setActiveCampaign({...activeCampaign, endDate: date})}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-reward-type">Reward Type</Label>
                      <Select 
                        value={activeCampaign.rewardType}
                        onValueChange={(value) => setActiveCampaign({
                          ...activeCampaign, 
                          rewardType: value as 'discount' | 'payout' | 'coupon'
                        })}
                      >
                        <SelectTrigger id="edit-reward-type">
                          <SelectValue placeholder="Select reward type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="discount">Discount</SelectItem>
                          <SelectItem value="payout">Cash Payout</SelectItem>
                          <SelectItem value="coupon">Coupon</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-reward-value">Reward Value</Label>
                      <Input 
                        id="edit-reward-value" 
                        value={activeCampaign.rewardValue}
                        onChange={(e) => setActiveCampaign({...activeCampaign, rewardValue: e.target.value})}
                        placeholder={activeCampaign.rewardType === 'payout' ? '$25' : '20%'}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-reward-details">Reward Details</Label>
                      <Textarea 
                        id="edit-reward-details" 
                        value={activeCampaign.rewardDetails}
                        onChange={(e) => setActiveCampaign({...activeCampaign, rewardDetails: e.target.value})}
                        placeholder="Describe the reward for your referrers"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-conversion-requirement">Conversions Required</Label>
                      <Select 
                        value={activeCampaign.conversionRequirement.toString()}
                        onValueChange={(value) => setActiveCampaign({
                          ...activeCampaign, 
                          conversionRequirement: parseInt(value)
                        })}
                      >
                        <SelectTrigger id="edit-conversion-requirement">
                          <SelectValue placeholder="Select requirement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 Conversion</SelectItem>
                          <SelectItem value="2">2 Conversions</SelectItem>
                          <SelectItem value="3">3 Conversions</SelectItem>
                          <SelectItem value="5">5 Conversions</SelectItem>
                          <SelectItem value="10">10 Conversions</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <Label htmlFor="edit-auto-reward">Automatic Rewards</Label>
                        <p className="text-sm text-muted-foreground">
                          Automatically send rewards when threshold is reached
                        </p>
                      </div>
                      <Switch
                        id="edit-auto-reward"
                        checked={activeCampaign.autoReward}
                        onCheckedChange={(checked) => setActiveCampaign({...activeCampaign, autoReward: checked})}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditing(false);
                    setActiveCampaign(null);
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => handleUpdateCampaign(activeCampaign)}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="create" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Campaign</CardTitle>
              <CardDescription>Set up a new referral campaign and configure rewards</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Campaign Name</Label>
                    <Input 
                      id="new-name" 
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign({...newCampaign, name: e.target.value})}
                      placeholder="Summer Referral Program"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-description">Description</Label>
                    <Textarea 
                      id="new-description" 
                      value={newCampaign.description}
                      onChange={(e) => setNewCampaign({...newCampaign, description: e.target.value})}
                      placeholder="Describe your referral campaign"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-status">Status</Label>
                    <Select 
                      value={newCampaign.status as string}
                      onValueChange={(value) => setNewCampaign({
                        ...newCampaign, 
                        status: value as 'active' | 'draft' | 'completed' | 'paused'
                      })}
                    >
                      <SelectTrigger id="new-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-start-date">Start Date</Label>
                      <DatePicker
                        id="new-start-date"
                        date={newCampaign.startDate}
                        setDate={(date) => setNewCampaign({...newCampaign, startDate: date || new Date()})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="new-end-date">End Date (Optional)</Label>
                      <DatePicker
                        id="new-end-date"
                        date={newCampaign.endDate}
                        setDate={(date) => setNewCampaign({...newCampaign, endDate: date})}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-reward-type">Reward Type</Label>
                    <Select 
                      value={newCampaign.rewardType as string}
                      onValueChange={(value) => setNewCampaign({
                        ...newCampaign, 
                        rewardType: value as 'discount' | 'payout' | 'coupon'
                      })}
                    >
                      <SelectTrigger id="new-reward-type">
                        <SelectValue placeholder="Select reward type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="payout">Cash Payout</SelectItem>
                        <SelectItem value="coupon">Coupon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-reward-value">Reward Value</Label>
                    <Input 
                      id="new-reward-value" 
                      value={newCampaign.rewardValue}
                      onChange={(e) => setNewCampaign({...newCampaign, rewardValue: e.target.value})}
                      placeholder={newCampaign.rewardType === 'payout' ? '$25' : '20%'}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-reward-details">Reward Details</Label>
                    <Textarea 
                      id="new-reward-details" 
                      value={newCampaign.rewardDetails}
                      onChange={(e) => setNewCampaign({...newCampaign, rewardDetails: e.target.value})}
                      placeholder="Describe the reward for your referrers"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-conversion-requirement">Conversions Required</Label>
                    <Select 
                      value={newCampaign.conversionRequirement?.toString() || "1"}
                      onValueChange={(value) => setNewCampaign({
                        ...newCampaign, 
                        conversionRequirement: parseInt(value)
                      })}
                    >
                      <SelectTrigger id="new-conversion-requirement">
                        <SelectValue placeholder="Select requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 Conversion</SelectItem>
                        <SelectItem value="2">2 Conversions</SelectItem>
                        <SelectItem value="3">3 Conversions</SelectItem>
                        <SelectItem value="5">5 Conversions</SelectItem>
                        <SelectItem value="10">10 Conversions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="new-auto-reward">Automatic Rewards</Label>
                      <p className="text-sm text-muted-foreground">
                        Automatically send rewards when threshold is reached
                      </p>
                    </div>
                    <Switch
                      id="new-auto-reward"
                      checked={newCampaign.autoReward || false}
                      onCheckedChange={(checked) => setNewCampaign({...newCampaign, autoReward: checked})}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setNewCampaign({
                  name: '',
                  description: '',
                  status: 'draft',
                  startDate: new Date(),
                  rewardType: 'discount',
                  rewardValue: '',
                  rewardDetails: '',
                  conversionRequirement: 1,
                  autoReward: true
                })}
              >
                Reset
              </Button>
              <Button onClick={handleCreateCampaign}>
                <Plus className="h-4 w-4 mr-2" />
                Create Campaign
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="rewards" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Available Reward Options</CardTitle>
              <CardDescription>
                Browse available coupons and rewards to offer your referrers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CouponRewards />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 