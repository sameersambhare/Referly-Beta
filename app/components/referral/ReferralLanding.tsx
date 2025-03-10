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
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { 
  CheckCircle2, 
  ArrowRight, 
  MessageSquare, 
  Gift, 
  Users, 
  Star, 
  Sparkles,
  ChevronRight
} from "lucide-react";

interface ReferralLandingProps {
  businessName: string;
  businessLogo?: string;
  referrerName: string;
  referralCode: string;
  offerDetails: string;
  testimonials?: Array<{
    name: string;
    text: string;
    rating?: number;
  }>;
}

export function ReferralLanding({
  businessName,
  businessLogo,
  referrerName,
  referralCode,
  offerDetails,
  testimonials = []
}: ReferralLandingProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };
  
  const handleBecomeReferrer = () => {
    // In a real app, this would redirect to the referrer signup page
    console.log('Becoming a referrer');
  };
  
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-2">
            {businessLogo ? (
              <img 
                src={businessLogo} 
                alt={businessName} 
                className="h-16 w-auto" 
              />
            ) : (
              <h1 className="text-3xl font-bold">{businessName}</h1>
            )}
            <p className="text-xl text-muted-foreground">
              {referrerName} has invited you to try {businessName}
            </p>
          </div>
          
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Gift className="h-5 w-5 mr-2" />
                Special Offer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-medium">{offerDetails}</p>
              <p className="text-sm text-muted-foreground mt-2">
                This offer is exclusive to referrals from {referrerName}
              </p>
            </CardContent>
          </Card>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Why Choose {businessName}?</h2>
            <ul className="space-y-3">
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                <span>Industry-leading service with personalized support</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                <span>Trusted by thousands of satisfied customers</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                <span>Innovative solutions tailored to your needs</span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                <span>Seamless onboarding and easy-to-use platform</span>
              </li>
            </ul>
          </div>
          
          {testimonials.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">What Our Customers Say</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {testimonials.map((testimonial, index) => (
                  <Card key={index} className="bg-muted/50">
                    <CardContent className="pt-6">
                      <div className="flex items-center mb-2">
                        {[...Array(testimonial.rating || 5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                      <p className="text-sm italic">"{testimonial.text}"</p>
                      <p className="text-sm font-medium mt-2">- {testimonial.name}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div>
          <Card className="sticky top-4">
            {submitted ? (
              <div className="p-6 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold">Thank You!</h2>
                <p className="text-muted-foreground">
                  Your information has been submitted successfully. We'll be in touch soon!
                </p>
                <div className="pt-4 space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex items-start space-x-4">
                      <div className="bg-primary rounded-full p-2 text-primary-foreground">
                        <Sparkles className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">Become a Referrer Too!</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Enjoy {businessName} and want to refer others? You can earn rewards too!
                        </p>
                        <Button 
                          className="mt-3" 
                          onClick={handleBecomeReferrer}
                        >
                          Get Your Referral Link
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <CardHeader>
                  <CardTitle>Sign Up Now</CardTitle>
                  <CardDescription>
                    Complete the form below to claim your special offer
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="info" onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="info">Your Info</TabsTrigger>
                      <TabsTrigger value="questions">Questions</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="info" className="space-y-4 mt-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input 
                            id="email" 
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number (Optional)</Label>
                          <Input 
                            id="phone" 
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="(123) 456-7890"
                          />
                        </div>
                        
                        <Button 
                          type="submit" 
                          className="w-full"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Submit'}
                        </Button>
                      </form>
                      
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          By submitting, you agree to our{' '}
                          <a href="#" className="underline">Terms of Service</a> and{' '}
                          <a href="#" className="underline">Privacy Policy</a>
                        </p>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="questions" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="message">Questions or Comments</Label>
                        <Textarea 
                          id="message" 
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Let us know if you have any questions..."
                          className="min-h-[150px]"
                        />
                      </div>
                      
                      <div className="flex justify-between">
                        <Button 
                          variant="outline" 
                          onClick={() => setActiveTab('info')}
                        >
                          Back to Info
                        </Button>
                        <Button 
                          type="button" 
                          onClick={handleSubmit}
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Submit'}
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-6">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    <span>Referred by {referrerName}</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <MessageSquare className="h-4 w-4 mr-1" />
                    <span>Need help? <a href="#" className="underline">Chat with us</a></span>
                  </div>
                </CardFooter>
              </>
            )}
          </Card>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-6">How It Works</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold">1</span>
            </div>
            <h3 className="font-medium">Sign Up</h3>
            <p className="text-sm text-muted-foreground">
              Complete the form with your information
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold">2</span>
            </div>
            <h3 className="font-medium">Get Started</h3>
            <p className="text-sm text-muted-foreground">
              Our team will reach out to help you get started
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
              <span className="text-lg font-bold">3</span>
            </div>
            <h3 className="font-medium">Enjoy Benefits</h3>
            <p className="text-sm text-muted-foreground">
              Experience the benefits and special offers
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 