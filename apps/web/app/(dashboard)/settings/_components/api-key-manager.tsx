'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, Badge, Input } from '@procura/ui';
import { api } from '@/lib/api';
import { Key, Eye, EyeOff, Trash2, CheckCircle2, AlertCircle, Plus, Loader2 } from 'lucide-react';

type ApiKeyEntry = {
  id: string;
  provider: string;
  keyPrefix: string;
  isActive: boolean;
  createdAt: string;
};

const PROVIDER_OPTIONS = [
  { value: 'openai', label: 'OpenAI', placeholder: 'sk-proj-...' },
  { value: 'anthropic', label: 'Anthropic', placeholder: 'sk-ant-...' },
  { value: 'google', label: 'Google AI', placeholder: 'AIza...' },
  { value: 'azure_openai', label: 'Azure OpenAI', placeholder: '...' },
  { value: 'custom', label: 'Custom', placeholder: 'Your API key' },
];

export function ApiKeyManager() {
  const { user } = useUser();
  const orgId = user?.organizationMemberships?.[0]?.id || null;
  const queryClient = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [provider, setProvider] = useState('openai');
  const [keyValue, setKeyValue] = useState('');

  const { data: keys, isLoading } = useQuery({
    queryKey: ['byok-keys', orgId],
    queryFn: () => api.get('/byok/keys', { organizationId: orgId || '' }),
    enabled: !!orgId,
  });

  const addMutation = useMutation({
    mutationFn: (keyData: { organizationId: string; provider: string; key: string }) =>
      api.post('/byok/keys', keyData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['byok-keys'] });
      setKeyValue('');
      setShowAdd(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (providerName: string) =>
      api.delete(`/byok/keys/${providerName}?organizationId=${orgId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['byok-keys'] }),
  });

  const toggleMutation = useMutation({
    mutationFn: (providerName: string) =>
      api.patch(`/byok/keys/${providerName}/toggle`, { organizationId: orgId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['byok-keys'] }),
  });

  const keyList: ApiKeyEntry[] = Array.isArray(keys) ? keys : [];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys (BYOK)</CardTitle>
            <CardDescription>Bring your own API keys for AI features. Keys are encrypted at rest.</CardDescription>
          </div>
          <Button size="sm" onClick={() => setShowAdd(true)} disabled={showAdd}>
            <Plus className="mr-1 h-4 w-4" /> Add Key
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showAdd && (
          <div className="rounded-lg border p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label htmlFor="provider" className="text-sm font-medium">Provider</label>
                <select
                  id="provider"
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  {PROVIDER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="apiKey" className="text-sm font-medium">API Key</label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder={PROVIDER_OPTIONS.find((o) => o.value === provider)?.placeholder}
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => { setShowAdd(false); setKeyValue(''); }}>Cancel</Button>
              <Button
                size="sm"
                onClick={() => addMutation.mutate({ organizationId: orgId || '', provider, key: keyValue })}
                disabled={!keyValue.trim() || addMutation.isPending}
              >
                {addMutation.isPending ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                Save Key
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-slate-300" /></div>
        ) : keyList.length === 0 && !showAdd ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Key className="mb-2 h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No API keys configured.</p>
            <p className="text-xs text-muted-foreground/60">AI features will use the default Procura API key.</p>
          </div>
        ) : (
          keyList.map((entry: any) => (
            <div key={entry.provider} className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium capitalize">{entry.provider.replace('_', ' ')}</span>
                    <Badge variant={entry.isActive ? 'success' : 'secondary'} className="text-[10px]">
                      {entry.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <code className="rounded bg-muted px-1 py-0.5 text-[10px]">
                      {entry.keyPrefix || entry.provider}
                    </code>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => toggleMutation.mutate(entry.provider)}>
                  {entry.isActive ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(entry.provider)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
