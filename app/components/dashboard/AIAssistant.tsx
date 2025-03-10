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

// Helper function to format message content with markdown-like syntax
const formatMessageContent = (content: string) => {
  // Format lists
  let formattedContent = content.replace(/^\s*[-*•]\s+(.+)$/gm, '<li>$1</li>');
  formattedContent = formattedContent.replace(/<li>(.+)<\/li>(\s*<li>)/g, '<li>$1</li><ul>$2');
  formattedContent = formattedContent.replace(/(<\/li>\s*)(?!<li>|<ul>)/g, '$1</ul>');
  
  // Format bold text
  formattedContent = formattedContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  formattedContent = formattedContent.replace(/__(.*?)__/g, '<strong>$1</strong>');
  
  // Format italic text
  formattedContent = formattedContent.replace(/\*(.*?)\*/g, '<em>$1</em>');
  formattedContent = formattedContent.replace(/_(.*?)_/g, '<em>$1</em>');
  
  // Format headings
  formattedContent = formattedContent.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  formattedContent = formattedContent.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  formattedContent = formattedContent.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  
  // Format paragraphs with proper spacing
  formattedContent = formattedContent.replace(/\n\n/g, '</p><p>');
  
  // Wrap in paragraph tags if not already wrapped
  if (!formattedContent.startsWith('<h1>') && 
      !formattedContent.startsWith('<h2>') && 
      !formattedContent.startsWith('<h3>') && 
      !formattedContent.startsWith('<p>') && 
      !formattedContent.startsWith('<ul>')) {
    formattedContent = `<p>${formattedContent}</p>`;
  }
  
  return formattedContent;
};

export function AIAssistant({ userName }: AIAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hello ${userName}! I'm your AI assistant powered by Gemini. I can help you manage your referral program, suggest follow-ups, and provide insights on your campaigns. How can I help you today?`,
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
      // Call the Gemini API
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          userName 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error details:", errorData);
        throw new Error(`Failed to get AI response: ${response.status}`);
      }

      const data = await response.json();
      
      // Add AI response
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(data.timestamp),
        },
      ]);
    } catch (error) {
      console.error('Error getting Gemini response:', error);
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

  // Suggested prompts for the user
  const suggestedPrompts = [
    "How can I improve my referral conversion rate?",
    "What are the best practices for follow-ups?",
    "Show me my campaign performance",
    "How do I create a new referral campaign?",
    "Suggest email templates for referral requests",
    "What incentives work best for referral programs?"
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          <CardTitle>AI Assistant</CardTitle>
        </div>
        <CardDescription>
          Your personal AI assistant powered by Google Gemini to help manage your referral program
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow overflow-y-auto px-4 pt-0 pb-2">
        <div className="space-y-6 max-h-[400px] overflow-y-auto pb-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex max-w-[85%] rounded-lg px-4 py-3 shadow-sm ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted/70 border border-border/30'
                }`}
              >
                <div className="mr-3 mt-1">
                  {message.role === 'user' ? (
                    <div className="bg-primary-foreground/20 p-1 rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                  ) : (
                    <div className="bg-primary/20 p-1 rounded-full">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  {message.isFallback && (
                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-2 font-medium">
                      <AlertCircle className="h-3 w-3" />
                      <span>Fallback response</span>
                    </div>
                  )}
                  {message.role === 'user' ? (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <div 
                      className="text-sm prose prose-sm dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                    />
                  )}
                  <p className="text-xs opacity-70 mt-2 text-right">
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
              <div className="flex max-w-[85%] rounded-lg px-4 py-3 bg-muted/70 border border-border/30 shadow-sm">
                <div className="mr-3 mt-1">
                  <div className="bg-primary/20 p-1 rounded-full">
                    <Bot className="h-4 w-4" />
                  </div>
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
          <p className="text-sm text-muted-foreground mb-2 font-medium">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button 
                key={index} 
                variant="outline" 
                size="sm"
                className="rounded-full text-xs"
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
            className="flex-1 rounded-full pl-4 pr-10 py-2 border-muted-foreground/20"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            size="icon"
            className="rounded-full absolute right-[1.5rem] bg-primary hover:bg-primary/90"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 