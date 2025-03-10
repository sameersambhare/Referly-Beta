import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Badge } from "@/app/components/ui/badge";
import { Textarea } from "@/app/components/ui/textarea";
import { 
  Copy, 
  Check, 
  MessageSquare, 
  Mail, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Share2,
  Sparkles,
  RefreshCw,
  ChevronRight
} from "lucide-react";

interface ReferrerInterfaceProps {
  referralCode: string;
  referrerName: string;
  businessName: string;
  rewardType: string;
  rewardValue: string;
}

export function ReferrerInterface({ 
  referralCode, 
  referrerName, 
  businessName,
  rewardType,
  rewardValue
}: ReferrerInterfaceProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('link');
  const [generatingMessage, setGeneratingMessage] = useState(false);
  const [customMessage, setCustomMessage] = useState('');
  
  // Mock data for AI-generated messages
  const [aiMessages, setAiMessages] = useState({
    sms: `Hey! I've been using ${businessName} and thought you might like it too. Use my referral link to sign up: https://referly.com/r/${referralCode}`,
    email: `Hi there,\n\nI wanted to share ${businessName} with you because I've had a great experience with them. If you're interested, you can use my referral link to sign up:\n\nhttps://referly.com/r/${referralCode}\n\nWe'll both benefit - you'll get access to their services and I'll earn ${rewardValue} ${rewardType === 'discount' ? 'discount' : 'reward'}.\n\nLet me know if you have any questions!\n\nBest,\n${referrerName}`,
    social: `I've been using ${businessName} and highly recommend checking them out! Use my referral link to sign up: https://referly.com/r/${referralCode} #referral #${businessName.replace(/\s+/g, '')}`
  });
  
  const [referralStats, setReferralStats] = useState({
    clicks: 12,
    conversions: 3,
    pendingRewards: 1,
    claimedRewards: 2
  });
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://referly.com/r/${referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleGenerateMessage = (type: 'sms' | 'email' | 'social') => {
    setGeneratingMessage(true);
    
    // Simulate AI generating a message
    setTimeout(() => {
      // In a real app, this would call an API to generate a message
      const newMessages = { ...aiMessages };
      
      if (type === 'sms') {
        newMessages.sms = `Hey! I thought you might be interested in ${businessName}. They offer great services and if you sign up with my link, you'll get a special offer: https://referly.com/r/${referralCode}`;
      } else if (type === 'email') {
        newMessages.email = `Hello,\n\nI wanted to reach out because I've been using ${businessName} and thought you might benefit from their services too.\n\nThey offer excellent [specific service/product] that has helped me with [specific benefit]. If you sign up using my referral link below, you'll get a special offer:\n\nhttps://referly.com/r/${referralCode}\n\nPlus, I'll earn ${rewardValue} ${rewardType === 'discount' ? 'discount' : 'reward'} when you join, so it's a win-win!\n\nFeel free to ask if you have any questions about my experience with them.\n\nBest regards,\n${referrerName}`;
      } else if (type === 'social') {
        newMessages.social = `Just discovered ${businessName} and it's been a game-changer for me! 🚀 If you're looking for [specific benefit], definitely check them out. Use my referral link to get started: https://referly.com/r/${referralCode} #recommended #${businessName.replace(/\s+/g, '')}`;
      }
      
      setAiMessages(newMessages);
      setGeneratingMessage(false);
    }, 1500);
  };
  
  const handleShareSMS = () => {
    const message = encodeURIComponent(activeTab === 'custom' ? customMessage : aiMessages.sms);
    window.open(`sms:?body=${message}`, '_blank');
  };
  
  const handleShareEmail = () => {
    const subject = encodeURIComponent(`Join ${businessName} with my referral`);
    const body = encodeURIComponent(activeTab === 'custom' ? customMessage : aiMessages.email);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };
  
  const handleShareFacebook = () => {
    const url = encodeURIComponent(`https://referly.com/r/${referralCode}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
  };
  
  const handleShareTwitter = () => {
    const text = encodeURIComponent(activeTab === 'custom' ? customMessage : aiMessages.social);
    const url = encodeURIComponent(`https://referly.com/r/${referralCode}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  };
  
  const handleShareLinkedIn = () => {
    const url = encodeURIComponent(`https://referly.com/r/${referralCode}`);
    const title = encodeURIComponent(`Join ${businessName} with my referral`);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&title=${title}`, '_blank');
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Your Referral Dashboard</CardTitle>
              <CardDescription>
                Share your referral link and earn rewards
              </CardDescription>
            </div>
            <Badge className="bg-primary text-lg px-4 py-2">
              {rewardValue} {rewardType === 'discount' ? 'Discount' : 'Reward'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium mb-2">Your Referral Link</h3>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-3 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                https://referly.com/r/{referralCode}
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
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardDescription>Link Clicks</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{referralStats.clicks}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardDescription>Conversions</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{referralStats.conversions}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardDescription>Pending Rewards</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{referralStats.pendingRewards}</p>
              </CardContent>
            </Card>
            
            <Card className="bg-muted/50">
              <CardHeader className="p-4 pb-2">
                <CardDescription>Claimed Rewards</CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="text-2xl font-bold">{referralStats.claimedRewards}</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral</CardTitle>
          <CardDescription>
            Choose how you want to share your referral link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="link" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="link">Link</TabsTrigger>
              <TabsTrigger value="message">Message</TabsTrigger>
              <TabsTrigger value="social">Social</TabsTrigger>
              <TabsTrigger value="custom">Custom</TabsTrigger>
            </TabsList>
            
            <TabsContent value="link" className="mt-4 space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Share your referral link directly</h3>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 p-3 bg-muted rounded-md text-sm font-mono overflow-x-auto">
                    https://referly.com/r/{referralCode}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Copy this link and share it anywhere - social media, email, messaging apps, etc.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <Button variant="outline" onClick={handleShareSMS}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS
                </Button>
                <Button variant="outline" onClick={handleShareEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" onClick={handleShareFacebook}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" onClick={handleShareTwitter}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" onClick={handleShareLinkedIn}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="message" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">AI-Generated SMS Message</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleGenerateMessage('sms')}
                  disabled={generatingMessage}
                >
                  {generatingMessage ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Regenerate
                </Button>
              </div>
              
              <div className="relative">
                <Textarea 
                  value={aiMessages.sms}
                  onChange={(e) => setAiMessages({...aiMessages, sms: e.target.value})}
                  className="min-h-[100px]"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    AI Generated
                  </Badge>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </Button>
                <Button onClick={handleShareSMS}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send SMS
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="social" className="mt-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">AI-Generated Social Post</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleGenerateMessage('social')}
                  disabled={generatingMessage}
                >
                  {generatingMessage ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Regenerate
                </Button>
              </div>
              
              <div className="relative">
                <Textarea 
                  value={aiMessages.social}
                  onChange={(e) => setAiMessages({...aiMessages, social: e.target.value})}
                  className="min-h-[100px]"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="text-xs">
                    AI Generated
                  </Badge>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleShareFacebook}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" onClick={handleShareTwitter}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" onClick={handleShareLinkedIn}>
                  <Linkedin className="h-4 w-4 mr-2" />
                  LinkedIn
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="custom" className="mt-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Create Your Own Message</h3>
                <p className="text-sm text-muted-foreground">
                  Write a personalized message to share with your referral link
                </p>
                <Textarea 
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Write your custom message here..."
                  className="min-h-[150px]"
                />
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={handleShareSMS}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS
                </Button>
                <Button variant="outline" onClick={handleShareEmail}>
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </Button>
                <Button variant="outline" onClick={handleShareFacebook}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook
                </Button>
                <Button variant="outline" onClick={handleShareTwitter}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>AI Referral Assistant</CardTitle>
          <CardDescription>
            Get personalized suggestions to maximize your referrals
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="bg-primary rounded-full p-2 text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Personalized Sharing Suggestions</h3>
                <p className="text-sm">
                  Based on your network, here are the best ways to share your referral:
                </p>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                    Share via email with colleagues who might need {businessName}'s services
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                    Post on LinkedIn to reach professional connections
                  </li>
                  <li className="flex items-center">
                    <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                    Send SMS to close friends who have mentioned needing similar services
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start space-x-4">
              <div className="bg-primary rounded-full p-2 text-primary-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="space-y-2">
                <h3 className="font-medium">Reward Status</h3>
                <p className="text-sm">
                  You're {referralStats.conversions} conversions away from earning your next {rewardValue} {rewardType === 'discount' ? 'discount' : 'reward'}.
                </p>
                <Button variant="outline" size="sm">
                  View Reward Details
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            Chat with AI Assistant
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 