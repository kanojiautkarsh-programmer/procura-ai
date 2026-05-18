'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge } from '@procura/ui';
import { cn } from '@procura/ui';
import { Mail, MessageSquare, BookOpen, Link2, Unlink, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { ApiKeyManager } from './_components/api-key-manager';

const integrations = [
  { id: 'gmail', name: 'Gmail', description: 'Auto-import invoice attachments from your Gmail inbox', icon: Mail, color: 'text-red-500', bg: 'bg-red-50' },
  { id: 'outlook', name: 'Outlook / Office 365', description: 'Sync invoices from your Outlook or Exchange inbox', icon: Mail, color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'teams', name: 'Microsoft Teams', description: 'Approve requests, view spend, and manage subscriptions from Teams', icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'quickbooks', name: 'QuickBooks Online', description: 'Export invoices and subscriptions, sync vendor data', icon: BookOpen, color: 'text-green-500', bg: 'bg-green-50' },
  { id: 'xero', name: 'Xero', description: 'Two-way sync of invoices, subscriptions, and chart of accounts', icon: BookOpen, color: 'text-teal-500', bg: 'bg-teal-50' },
];

export default function SettingsPage() {
  const [connections, setConnections] = useState<Record<string, boolean>>({});
  const toggle = (id: string) => setConnections((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500">Manage integrations, API keys, and configuration.</p>
      </div>

      <ApiKeyManager />

      <Card className="rounded-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">Integrations</CardTitle>
          <CardDescription className="text-xs text-slate-500">Connect your tools to automate procurement workflows.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.map((integration) => {
            const Icon = integration.icon;
            const isConnected = connections[integration.id];
            return (
              <div key={integration.id} className="card-hover rounded-xl border border-slate-200 bg-white p-4 transition-all">
                <div className="flex items-start justify-between">
                  <div className={cn('rounded-lg p-2', integration.bg)}>
                    <Icon className={cn('h-4 w-4', integration.color)} />
                  </div>
                  {isConnected ? (
                    <Badge variant="outline" className="rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full text-[10px] text-slate-400">Disconnected</Badge>
                  )}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-slate-900">{integration.name}</h3>
                <p className="mt-1 text-xs text-slate-500 leading-relaxed">{integration.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <Button
                    size="sm"
                    variant={isConnected ? 'outline' : 'default'}
                    className={cn('h-7 gap-1 rounded-lg text-xs', isConnected ? 'border-slate-200 text-slate-600' : 'bg-blue-600 text-white hover:bg-blue-700')}
                    onClick={() => toggle(integration.id)}
                  >
                    {isConnected ? <><Unlink className="h-3 w-3" /> Disconnect</> : <><Link2 className="h-3 w-3" /> Connect</>}
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">Email Ingestion Rules</CardTitle>
          <CardDescription className="text-xs text-slate-500">Configure which emails are auto-processed for invoice extraction.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 px-6 py-8 text-center">
            <AlertCircle className="mb-2 h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-500">No ingestion rules configured.</p>
            <p className="mt-0.5 text-xs text-slate-400">Connect Gmail or Outlook above, then create rules to auto-import invoices.</p>
            <Button variant="outline" size="sm" className="mt-4 gap-1 rounded-lg border-slate-200 text-slate-600" disabled>
              Create Rule
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl border-slate-200">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-slate-900">Accounting Mapping</CardTitle>
          <CardDescription className="text-xs text-slate-500">Map Procura categories and vendors to your accounting chart of accounts.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: 'Chart of Accounts', desc: '0 accounts mapped' },
            { label: 'Vendor Mapping', desc: '0 vendors mapped' },
            { label: 'Category Mapping', desc: '0 categories mapped' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-900">{item.label}</p>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
              <Button variant="outline" size="sm" className="h-7 rounded-lg border-slate-200 text-xs text-slate-600" disabled>
                Configure
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
