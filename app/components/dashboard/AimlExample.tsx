"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card'
import { useToast } from '@/app/components/ui/use-toast'
import { Bot, RotateCw, Send, User } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isFallback?: boolean;
}

interface AimlExampleProps {
  userName?: string;
}

export function AimlExample({ userName = "User" }: AimlExampleProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${userName}! I'm your Referral AI assistant powered by AIML. I can help you optimize your referral program, suggest follow-up strategies, and provide insights on your campaigns. How can I help you today?`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
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
    if (!input.trim() || isLoading) return;

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
      // Call the AIML API
      const response = await fetch('/api/openai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      // Store conversation ID if provided
      if (data.conversationId) {
        setConversationId(data.conversationId);
      }
      
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
          isFallback: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      // Focus input after response
      inputRef.current?.focus();
    }
  };

  // Reset the conversation
  const handleResetConversation = async () => {
    setIsResetting(true);
    try {
      const response = await fetch('/api/openai-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reset_conversation' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset conversation');
      }
      
      // Reset conversation ID
      setConversationId(null);
      
      // Reset messages
      setMessages([
        {
          role: 'assistant',
          content: `Hello ${userName}! I'm your Referral AI assistant powered by AIML. I can help you optimize your referral program, suggest follow-up strategies, and provide insights on your campaigns. How can I help you today?`,
          timestamp: new Date(),
        },
      ]);
      
      toast({
        title: "Conversation Reset",
        description: "Started a new conversation with the AI assistant.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error resetting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to reset the conversation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  // Suggested prompts for the user
  const suggestedPrompts = [
    "How can I improve my referral conversion rate?",
    "What are the best practices for follow-ups?",
    "How do I create an effective referral incentive?",
    "What metrics should I track for my referral program?"
  ];

  return (
    <Card className="border-accent">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5 text-primary" />
          AIML Assistant
        </CardTitle>
        <CardDescription>
          Your AI-powered referral program assistant
        </CardDescription>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleResetConversation}
          disabled={isResetting}
          className="absolute top-4 right-4"
        >
          <RotateCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[600px] overflow-y-auto p-4 -mx-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              <div className={`flex max-w-[80%] ${msg.role === 'assistant' ? 'rounded-lg px-4 py-2 bg-muted' : 'rounded-lg px-4 py-2 bg-primary text-primary-foreground'}`}>
                <div className="mr-2 mt-1">
                  {msg.role === 'assistant' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {msg.timestamp.toLocaleTimeString()}
                    {msg.isFallback && ' (Fallback Response)'}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {(isLoading || isResetting) && (
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
      
      {messages.length === 1 && !isLoading && !isResetting && (
        <div className="px-4 pb-4">
          <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm"
                className="border-accent"
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
      
      <CardFooter>
        <div className="flex w-full items-center space-x-2">
          <Input
            ref={inputRef}
            placeholder="Ask about your referral program..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={isLoading || isResetting}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || isResetting || !input.trim()}
            size="icon"
            className="glow-effect"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 