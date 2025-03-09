"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { useToast } from '@/app/components/ui/use-toast'
import { AlertCircle, Bot, Send, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isFallback?: boolean;
}

interface AIAssistantProps {
  userName: string;
}

export function AIAssistant({ userName }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${userName}! I'm your AI assistant powered by DeepSeek. I can help you manage your referral program, suggest follow-ups, and provide insights on your campaigns. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call the AI assistant API
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Check if fallback was used
      const isFallback = data.fallback === true;
      
      if (isFallback) {
        toast({
          title: "Using Fallback Response",
          description: "We're currently using a local response as we couldn't connect to the AI service.",
          variant: "default",
        });
      }
      
      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
          isFallback,
        },
      ]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get a response from the AI assistant. Please try again.",
        variant: "destructive",
      });
      
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      // Focus input after response
      inputRef.current?.focus();
    }
  };

  // Suggested prompts for the user
  const suggestedPrompts = [
    "How can I improve my referral conversion rate?",
    "What are the best practices for follow-ups?",
    "Show me my campaign performance",
    "How do I create a new referral campaign?"
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>AI Assistant</CardTitle>
        </div>
        <CardDescription>
          Your personal AI assistant powered by DeepSeek to help manage your referral program
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto px-4 pt-0 pb-2">
        <div className="space-y-4 max-h-[400px] overflow-y-auto pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted'
                }`}
              >
                <div className="mr-2 mt-1">
                  {message.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div className="flex-1">
                  {message.isFallback && (
                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>Fallback response</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex max-w-[80%] rounded-lg px-4 py-2 bg-muted">
                <div className="mr-2 mt-1">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex space-x-2 items-center">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-75"></div>
                  <div className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce delay-150"></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      {messages.length === 1 && !isLoading && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setInput(prompt);
                  inputRef.current?.focus();
                }}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      <CardFooter className="border-t pt-4">
        <div className="flex w-full items-center space-x-2">
          <Input
            ref={inputRef}
            placeholder="Ask your AI assistant..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 