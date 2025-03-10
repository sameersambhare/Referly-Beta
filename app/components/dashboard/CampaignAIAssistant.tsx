import { useState, useEffect, useRef } from 'react';
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
import { Textarea } from "@/app/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Loader2,
  Link,
  Settings,
  Users,
  Gift,
  CheckCircle2
} from "lucide-react";

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface CampaignAIAssistantProps {
  businessName: string;
  userName: string;
  onCreateCampaign?: (campaignData: any) => void;
  onCreateTask?: (taskData: any) => void;
}

export function CampaignAIAssistant({ 
  businessName, 
  userName, 
  onCreateCampaign,
  onCreateTask
}: CampaignAIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi ${userName}! I'm your campaign assistant for ${businessName}. I can help you set up referral campaigns, create tasks for referees, and integrate with your user database via Zapier. What would you like to do today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [zapierConnected, setZapierConnected] = useState(false);
  const [zapierIntegrations, setZapierIntegrations] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    // Process user message
    await processUserMessage(userMessage.content);
  };
  
  const processUserMessage = async (content: string) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const lowerContent = content.toLowerCase();
    
    // Check for campaign creation intent
    if (lowerContent.includes('create campaign') || lowerContent.includes('new campaign') || lowerContent.includes('start campaign')) {
      handleCampaignCreationIntent();
      return;
    }
    
    // Check for task creation intent
    if (lowerContent.includes('create task') || lowerContent.includes('new task') || lowerContent.includes('add task')) {
      handleTaskCreationIntent();
      return;
    }
    
    // Check for Zapier integration intent
    if (lowerContent.includes('zapier') || lowerContent.includes('integrate') || lowerContent.includes('connection') || lowerContent.includes('user database')) {
      handleZapierIntegrationIntent();
      return;
    }
    
    // Check for reward setup intent
    if (lowerContent.includes('reward') || lowerContent.includes('discount') || lowerContent.includes('payout')) {
      handleRewardSetupIntent();
      return;
    }
    
    // Default response
    const assistantMessage: Message = {
      role: 'assistant',
      content: `I can help you with setting up referral campaigns for ${businessName}. Here are some things I can assist with:
      
1. **Create a new campaign** - Set up a referral campaign with custom rewards
2. **Create tasks** - Define what referred users need to do to earn rewards
3. **Connect to Zapier** - Integrate with your user database
4. **Set up rewards** - Configure discount codes or cash payouts
5. **Analyze performance** - Get insights on your referral campaigns

What would you like to do?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };
  
  const handleCampaignCreationIntent = () => {
    const assistantMessage: Message = {
      role: 'assistant',
      content: `Great! Let's create a new referral campaign for ${businessName}. 

To get started, I'll need some basic information:

1. What would you like to name this campaign?
2. What is the goal of this campaign? (e.g., acquire new customers, increase sales)
3. What type of reward would you like to offer?
   - **Discount**: One-time discount code for referrers
   - **Payout**: Cash payment for each successful referral

Once we have this information, we can set up the campaign and create specific tasks for referred users to complete.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    // In a real implementation, we would wait for user responses and then call onCreateCampaign
  };
  
  const handleTaskCreationIntent = () => {
    const assistantMessage: Message = {
      role: 'assistant',
      content: `Let's create a task for your referral campaign. Tasks are actions that referred users need to complete to trigger rewards.

For a task, we need to define:

1. **Task title**: A clear name for the task (e.g., "Sign up for a free trial")
2. **Description**: Details about what the referred user needs to do
3. **Completion criteria**: How you'll verify the task was completed
4. **Reward type**: Discount code or cash payout
5. **Reward value**: The amount or percentage of the reward

Some popular task examples:
- Sign up for a free trial
- Schedule a demo
- Make a first purchase
- Complete an onboarding process

What type of task would you like to create?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    // In a real implementation, we would wait for user responses and then call onCreateTask
  };
  
  const handleZapierIntegrationIntent = () => {
    // Simulate connecting to Zapier
    setZapierConnected(true);
    setZapierIntegrations(['CRM System', 'Email Marketing Platform', 'Customer Database']);
    
    const assistantMessage: Message = {
      role: 'assistant',
      content: `I've connected to your Zapier account and found the following integrations that can be used with your referral campaigns:

1. **CRM System** - Import existing customers as potential referrers
2. **Email Marketing Platform** - Send automated emails to referrers and referees
3. **Customer Database** - Track referral conversions and reward distribution

Would you like me to set up an automated workflow to:
1. Import your existing customers as potential referrers
2. Generate personalized referral links for each customer
3. Send them an email with their unique link
4. Track when their referrals complete tasks
5. Automatically issue rewards

This will help you quickly launch your referral program with your existing customer base.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };
  
  const handleRewardSetupIntent = () => {
    const assistantMessage: Message = {
      role: 'assistant',
      content: `Let's set up the rewards for your referral campaign. You have two main options:

**Option 1: Discount Rewards**
- Referrers receive a one-time discount code
- They can use this for their next purchase
- This is ideal for encouraging repeat business
- Example: 25% off their next order

**Option 2: Cash Payouts**
- Referrers earn cash for each successful referral
- They can choose their payout method (ACH via Stripe, Venmo, or PayPal)
- This is ideal for high-value referrals
- Example: $50 for each referred customer who completes a task

For San Francisco-based businesses like yours, we've seen the most success with:
- Tech companies: $50-100 cash payouts per successful referral
- Retail: 25-30% discount codes
- Services: Tiered rewards ($25 for sign-up, $75 for conversion)

Which reward type would you prefer to set up?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };
  
  const formatMessage = (content: string) => {
    // Replace line breaks with <br> tags
    let formattedContent = content.replace(/\n/g, '<br>');
    
    // Format lists
    formattedContent = formattedContent.replace(/(\d+\.\s+.*?)(?=<br>\d+\.|<br><br>|$)/g, '<li>$1</li>');
    formattedContent = formattedContent.replace(/<li>(.*?)<\/li>(?:<br>)?(?:<li>|$)/g, (match) => {
      if (!match.includes('<ul>')) {
        return '<ul class="list-disc pl-5 my-2">' + match;
      }
      return match;
    });
    if (formattedContent.includes('<li>') && !formattedContent.endsWith('</ul>')) {
      formattedContent += '</ul>';
    }
    
    // Format bold text
    formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Format paragraphs
    formattedContent = formattedContent.replace(/<br><br>/g, '</p><p>');
    if (!formattedContent.startsWith('<ul>') && !formattedContent.startsWith('<p>')) {
      formattedContent = '<p>' + formattedContent;
    }
    if (!formattedContent.endsWith('</ul>') && !formattedContent.endsWith('</p>')) {
      formattedContent += '</p>';
    }
    
    return formattedContent;
  };
  
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/ai-assistant.png" alt="AI" />
              <AvatarFallback>
                <Bot className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">Campaign Assistant</CardTitle>
              <CardDescription>Powered by AI</CardDescription>
            </div>
          </div>
          {zapierConnected && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Link className="h-3 w-3" />
              <span>Zapier Connected</span>
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto p-4">
        <div className="space-y-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.role === 'assistant' ? 'justify-start' : 'justify-end'}`}
            >
              <div 
                className={`flex gap-3 max-w-[80%] ${
                  message.role === 'assistant' 
                    ? 'bg-muted rounded-lg p-3' 
                    : 'bg-primary text-primary-foreground rounded-lg p-3'
                }`}
              >
                {message.role === 'assistant' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/ai-assistant.png" alt="AI" />
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                {message.role === 'user' && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src="/user-avatar.png" alt="User" />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      <CardFooter className="flex-shrink-0 border-t p-4">
        <form 
          className="flex w-full items-center space-x-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <Input
            placeholder="Ask about campaign setup, tasks, or integrations..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={isLoading || !input.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardFooter>
      
      {zapierConnected && zapierIntegrations.length > 0 && (
        <div className="px-4 pb-4">
          <div className="bg-muted rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Link className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-medium">Connected Integrations</h4>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {zapierIntegrations.map((integration, index) => (
                <Badge key={index} variant="outline" className="justify-center">
                  {integration}
                </Badge>
              ))}
            </div>
            <div className="flex justify-between mt-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3 w-3" />
                <span>User database ready for import</span>
              </div>
              <Button variant="ghost" size="sm" className="h-6 text-xs">
                <Settings className="h-3 w-3 mr-1" />
                Configure
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 