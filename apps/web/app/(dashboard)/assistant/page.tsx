'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Input, Button, Avatar, AvatarFallback } from '@procura/ui';
import { Bot, Send, User, Sparkles } from 'lucide-react';
import { ChatMessage } from './_components/chat-message';
import { SuggestedQuestions } from './_components/suggested-questions';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const DEFAULT_SUGGESTIONS = [
  'How much did we spend on software last month?',
  'What subscriptions are up for renewal this month?',
  'Find overlapping tools we could consolidate',
  'Show me pending approval requests',
  'What is our vendor spend policy for new contracts?',
];

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hi! I\'m your AI procurement assistant. I can help you analyze spending, find savings opportunities, answer policy questions, and track renewals. What would you like to know?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/assistant/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: content.trim(),
          organizationId: 'org_demo',
        }),
      });

      const data = await res.json();

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.answer || 'Sorry, I couldn\'t process that request.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: 'I encountered an error. Please try again.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="flex flex-1 flex-col">
        <div className="mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Procurement Assistant</h1>
          <p className="text-muted-foreground">
            Ask questions about your spending, vendors, renewals, and policies.
          </p>
        </div>

        <Card className="flex flex-1 flex-col">
          <CardHeader className="border-b pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">AI Assistant</CardTitle>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {loading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10">
                      <Bot className="h-4 w-4 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-1 rounded-lg bg-muted px-4 py-3">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-primary/50" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          </CardContent>

          <div className="border-t p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Ask about spend, vendors, renewals, or policies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={loading}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || loading}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </Card>
      </div>

      <div className="hidden w-72 shrink-0 lg:block">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Suggested Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <SuggestedQuestions
              questions={DEFAULT_SUGGESTIONS}
              onSelect={(q) => sendMessage(q)}
              disabled={loading}
            />
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Capabilities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Spend analysis & trends
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Vendor & subscription info
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Contract & renewal tracking
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Procurement policy Q&A
            </div>
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
              Savings recommendations
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
