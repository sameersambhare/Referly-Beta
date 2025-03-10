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
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { 
  Send, 
  Bot, 
  User, 
  Loader2,
  CheckCircle2,
  HelpCircle,
  ArrowRight
} from "lucide-react";

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completionCriteria: string;
  rewardType: 'discount' | 'payout';
  rewardValue: string;
}

interface ReferralChatbotProps {
  businessName: string;
  referrerName: string;
  task: Task;
  onTaskComplete?: (data: any) => void;
}

export function ReferralChatbot({ 
  businessName, 
  referrerName,
  task,
  onTaskComplete
}: ReferralChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi there! I'm your assistant for ${businessName}. ${referrerName} has referred you to complete a task: "${task.title}". I'm here to help you through the process. What questions do you have?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0); // 0-100
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [completionData, setCompletionData] = useState({
    name: '',
    email: '',
    phone: '',
    verificationInfo: ''
  });
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
    
    // Check for task details intent
    if (lowerContent.includes('what') && (lowerContent.includes('task') || lowerContent.includes('do'))) {
      handleTaskDetailsIntent();
      return;
    }
    
    // Check for reward details intent
    if (lowerContent.includes('reward') || lowerContent.includes('get') || lowerContent.includes('earn')) {
      handleRewardDetailsIntent();
      return;
    }
    
    // Check for how to complete intent
    if (lowerContent.includes('how') || lowerContent.includes('complete') || lowerContent.includes('finish')) {
      handleHowToCompleteIntent();
      return;
    }
    
    // Check for ready to complete intent
    if (lowerContent.includes('ready') || lowerContent.includes('done') || lowerContent.includes('completed') || lowerContent.includes('finish')) {
      handleReadyToCompleteIntent();
      return;
    }
    
    // Default response
    const assistantMessage: Message = {
      role: 'assistant',
      content: `I'm here to help you complete the "${task.title}" task for ${businessName}. Here are some things I can assist with:
      
1. Explain what the task involves
2. Tell you about the reward you'll earn
3. Guide you through the completion process
4. Help you submit your completion for verification

What would you like to know more about?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    // Increment progress slightly for engagement
    setTaskProgress(prev => Math.min(prev + 5, 40));
  };
  
  const handleTaskDetailsIntent = () => {
    const assistantMessage: Message = {
      role: 'assistant',
      content: `The task "${task.title}" involves:

${task.description}

To successfully complete this task, you need to:
${task.completionCriteria}

Would you like me to guide you through the process step by step?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    // Increment progress
    setTaskProgress(prev => Math.min(prev + 15, 50));
  };
  
  const handleRewardDetailsIntent = () => {
    const assistantMessage: Message = {
      role: 'assistant',
      content: `Great question about the rewards!

When you complete this task, ${referrerName} will receive a ${task.rewardType === 'discount' ? 'discount' : 'cash reward'} of ${task.rewardValue}.

${task.rewardType === 'discount' 
  ? `This is a one-time discount that can be used on their next purchase with ${businessName}.` 
  : `This is a cash reward that will be paid out through their chosen payment method (ACH, Venmo, or PayPal).`}

Additionally, you'll also be eligible to join the referral program and earn rewards by referring others!

Would you like to proceed with completing the task?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    // Increment progress
    setTaskProgress(prev => Math.min(prev + 10, 60));
  };
  
  const handleHowToCompleteIntent = () => {
    const assistantMessage: Message = {
      role: 'assistant',
      content: `Here's how to complete the "${task.title}" task:

1. ${task.completionCriteria.split('\n')[0] || 'Follow the instructions provided'}
2. Once you've completed the actions, click the "I've Completed the Task" button below
3. Fill in your details so we can verify your completion
4. Submit your information for verification
5. ${businessName} will verify your completion
6. Once verified, the reward will be issued to ${referrerName}

Are you ready to get started?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    
    // Increment progress
    setTaskProgress(prev => Math.min(prev + 20, 70));
  };
  
  const handleReadyToCompleteIntent = () => {
    const assistantMessage: Message = {
      role: 'assistant',
      content: `Great! You're ready to complete the task.

Please click the "I've Completed the Task" button below, and I'll guide you through the verification process.

Once verified, ${referrerName} will receive their ${task.rewardType === 'discount' ? 'discount code' : 'cash reward'}.`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    setShowCompletionForm(true);
    
    // Increment progress
    setTaskProgress(prev => Math.min(prev + 20, 90));
  };
  
  const handleSubmitCompletion = () => {
    // Validate form
    if (!completionData.name || !completionData.email) {
      // Show error
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Please provide your name and email to submit your task completion.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }
    
    // In a real app, this would submit to an API
    if (onTaskComplete) {
      onTaskComplete({
        ...completionData,
        taskId: task.id,
        completionDate: new Date()
      });
    }
    
    // Show success message
    const successMessage: Message = {
      role: 'assistant',
      content: `Thank you for submitting your task completion! 

Your information has been sent to ${businessName} for verification. Once verified, ${referrerName} will receive their ${task.rewardType === 'discount' ? 'discount code' : 'cash reward'}.

Would you like to join the referral program yourself and start earning rewards?`,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, successMessage]);
    setShowCompletionForm(false);
    
    // Complete progress
    setTaskProgress(100);
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
              <CardTitle className="text-lg">{businessName} Assistant</CardTitle>
              <CardDescription>Here to help you complete your task</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            <span>Task Progress: {taskProgress}%</span>
          </Badge>
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
      
      {showCompletionForm ? (
        <div className="p-4 border-t">
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Complete Task Verification</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Name</label>
                <Input 
                  value={completionData.name}
                  onChange={(e) => setCompletionData({...completionData, name: e.target.value})}
                  placeholder="John Doe"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Address</label>
                <Input 
                  type="email"
                  value={completionData.email}
                  onChange={(e) => setCompletionData({...completionData, email: e.target.value})}
                  placeholder="john@example.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number (Optional)</label>
              <Input 
                type="tel"
                value={completionData.phone}
                onChange={(e) => setCompletionData({...completionData, phone: e.target.value})}
                placeholder="(123) 456-7890"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Verification Information</label>
              <Input 
                value={completionData.verificationInfo}
                onChange={(e) => setCompletionData({...completionData, verificationInfo: e.target.value})}
                placeholder="Any additional information to verify your task completion"
              />
            </div>
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setShowCompletionForm(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSubmitCompletion}>
                Submit Completion
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <CardFooter className="flex-shrink-0 border-t p-4">
          <div className="w-full space-y-4">
            <form 
              className="flex w-full items-center space-x-2"
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
            >
              <Input
                placeholder="Ask about the task or how to complete it..."
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
            
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleHowToCompleteIntent()}
                className="flex items-center gap-1"
              >
                <HelpCircle className="h-4 w-4" />
                How to Complete
              </Button>
              
              <Button 
                variant="default" 
                size="sm"
                onClick={() => handleReadyToCompleteIntent()}
                className="flex items-center gap-1"
              >
                <CheckCircle2 className="h-4 w-4" />
                I've Completed the Task
              </Button>
            </div>
          </div>
        </CardFooter>
      )}
      
      {taskProgress === 100 && (
        <div className="p-4 border-t bg-muted/50">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium">Task Completed!</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Your submission has been received and is pending verification.
              </p>
              <Button 
                variant="link" 
                className="h-auto p-0 text-xs flex items-center mt-2"
                onClick={() => {
                  // In a real app, this would navigate to the referrer signup page
                  window.location.href = "/r/signup";
                }}
              >
                Become a referrer yourself
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 