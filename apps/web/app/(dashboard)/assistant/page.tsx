'use client';

import { useState, useRef, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Button, Input } from '@procura/ui';
import { cn } from '@procura/ui';
import { Sparkles, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const WELCOME: Message = {
  role: 'assistant',
  content: "Hello! I'm your procurement AI assistant. I can help you with:\n\n- **Spend analysis** — \"How much did we spend on SaaS last month?\"\n- **Subscription info** — \"What subscriptions are renewing next month?\"\n- **Vendor insights** — \"Show me our top vendors by spend\"\n- **Approvals** — \"What's pending my approval?\"\n- **Negotiation tips** — \"How should I negotiate with Salesforce?\"",
  timestamp: new Date(),
};

const quickActions = [
  { label: 'Top vendors by spend', query: 'Show me my top vendors by spend' },
  { label: 'Renewals next month', query: 'What subscriptions are renewing next month?' },
  { label: 'Pending approvals', query: 'What approvals are pending?' },
  { label: 'Monthly spend trend', query: 'How has our monthly spend trended this year?' },
];

export default function AssistantPage() {
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.id || null;
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await api.post('/assistant/ask', { query: text, organizationId: orgId });
      const response: Message = {
        role: 'assistant',
        content: res.answer || res.message || res.data || "I couldn't process your request. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, response]);
    } catch {
      const fallback: Message = {
        role: 'assistant',
        content: "I'm having trouble reaching the AI service. Please make sure the backend is running and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallback]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-3.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
          <Sparkles className="h-4 w-4 text-white" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Procura AI Assistant</h2>
          <p className="text-xs text-slate-400">Powered by GPT-4o-mini · Your data is private</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 scrollbar-thin">
        {messages.map((msg, idx) => (
          <div key={idx} className={cn('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
            {msg.role === 'assistant' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                <Bot className="h-4 w-4 text-blue-600" />
              </div>
            )}
            <div className={cn(
              'max-w-[70%] rounded-xl px-4 py-3 text-sm leading-relaxed',
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-slate-50 text-slate-700 rounded-bl-sm border border-slate-200',
            )}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
            {msg.role === 'user' && (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <User className="h-4 w-4 text-slate-500" />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Bot className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-4 py-3 border border-slate-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
              <span className="text-sm text-slate-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="flex gap-2 overflow-x-auto px-5 py-2 border-t border-slate-100">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => sendMessage(action.query)}
              className="shrink-0 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-slate-200 px-5 py-3.5">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Ask about your spend, subscriptions, or vendors..."
            className="h-10 rounded-lg border-slate-200 bg-slate-50 px-4 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
          />
          <Button
            size="icon"
            className="h-10 w-10 shrink-0 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
