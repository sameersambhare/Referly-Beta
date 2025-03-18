"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/app/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { 
  ArrowRight, 
  Gift, 
  Share2, 
  Users 
} from "lucide-react";

interface ReferralLandingProps {
  businessCode: string;
  businessName: string;
  referralCode?: string;
  rewardType: string;
  rewardValue: string;
  rewardDescription: string;
}

export function ReferralLanding({
  businessCode,
  businessName,
  rewardType,
  rewardValue,
  rewardDescription
}: ReferralLandingProps) {
  const [currentTab, setCurrentTab] = useState("overview");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Join {businessName}'s Referral Program
          </h1>
          <p className="text-xl text-muted-foreground">
            Earn rewards by referring your friends and family
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="relative h-[300px] rounded-lg overflow-hidden">
            <Image
              src="/images/referral-hero.jpg"
              alt="Referral Program"
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-bold mb-4">
              How It Works
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Invite Friends</h3>
                  <p className="text-muted-foreground">
                    Share your unique referral link with friends and family
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Share2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">They Sign Up</h3>
                  <p className="text-muted-foreground">
                    When they join using your link, you'll both be eligible for rewards
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Gift className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Get Rewarded</h3>
                  <p className="text-muted-foreground">
                    Earn {rewardValue} {rewardType} for each successful referral
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Program Overview</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>About the Program</CardTitle>
                <CardDescription>
                  Learn more about our referral program and how you can participate
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>
                  {businessName}'s referral program is designed to reward our loyal customers
                  for spreading the word about our products and services.
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Program Highlights</h4>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                    <li>Easy to participate - just share your unique link</li>
                    <li>Rewards for both you and your referrals</li>
                    <li>Track your referrals and earnings in real-time</li>
                    <li>No limit on how much you can earn</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Reward Details</CardTitle>
                <CardDescription>
                  Learn about the rewards you can earn through our referral program
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-primary/10 p-6 rounded-lg text-center">
                  <h3 className="text-2xl font-bold mb-2">
                    {rewardValue} {rewardType}
                  </h3>
                  <p className="text-muted-foreground">{rewardDescription}</p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold">How to Claim Your Rewards</h4>
                  <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                    <li>Share your unique referral link with friends</li>
                    <li>Your friends sign up using your link</li>
                    <li>Once they complete the required actions, you'll earn your reward</li>
                    <li>Rewards will be automatically credited to your account</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-8 text-center">
          <Button size="lg" className="gap-2">
            Start Referring
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
} 