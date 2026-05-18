'use client';

import { useState } from 'react';
import { Button, Input, Card, CardContent } from '@procura/ui';
import { api } from '@/lib/api';
import { Plus, Trash2, TrendingDown, BarChart3 } from 'lucide-react';

interface ScenarioSimulatorProps {
  currentMonthly: number;
}

interface CostCut {
  name: string;
  monthlySavings: number;
}

export function ScenarioSimulator({ currentMonthly }: ScenarioSimulatorProps) {
  const [growthRate, setGrowthRate] = useState('5');
  const [months, setMonths] = useState('12');
  const [costCuts, setCostCuts] = useState<CostCut[]>([]);
  const [newCutName, setNewCutName] = useState('');
  const [newCutAmount, setNewCutAmount] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const addCut = () => {
    if (!newCutName || !newCutAmount) return;
    setCostCuts((prev) => [...prev, { name: newCutName, monthlySavings: parseFloat(newCutAmount) }]);
    setNewCutName('');
    setNewCutAmount('');
  };

  const removeCut = (i: number) => {
    setCostCuts((prev) => prev.filter((_, idx) => idx !== i));
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await api.post('/forecast/scenario', {
        organizationId: 'org_demo',
        growthRate: parseFloat(growthRate),
        costCuts: costCuts.map((c) => ({ name: c.name, monthlySavings: c.monthlySavings })),
        months: parseInt(months),
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium">Current Monthly Spend</label>
          <Input value={`$${currentMonthly.toLocaleString()}`} disabled />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium">Growth Rate (%/yr)</label>
            <Input
              type="number"
              value={growthRate}
              onChange={(e) => setGrowthRate(e.target.value)}
              placeholder="5"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Simulation Period (months)</label>
            <Input
              type="number"
              value={months}
              onChange={(e) => setMonths(e.target.value)}
              placeholder="12"
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Cost Reduction Actions</label>
          <div className="space-y-2">
            {costCuts.map((cut, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
                <TrendingDown className="h-4 w-4 text-green-500" />
                <span className="flex-1">{cut.name}</span>
                <span className="font-medium text-green-600">-${cut.monthlySavings}/mo</span>
                <button onClick={() => removeCut(i)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <Input
                placeholder="Action name"
                value={newCutName}
                onChange={(e) => setNewCutName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="$ savings/mo"
                value={newCutAmount}
                onChange={(e) => setNewCutAmount(e.target.value)}
                className="w-28"
              />
              <Button variant="outline" size="icon" onClick={addCut}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <Button onClick={runSimulation} disabled={loading} className="w-full">
          {loading ? 'Simulating...' : 'Run Simulation'}
        </Button>
      </div>

      <div>
        {result ? (
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current Monthly</p>
                    <p className="text-xl font-bold">${result.scenario?.currentMonthly?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Projected ({result.scenario?.months}mo)</p>
                    <p className="text-xl font-bold">${result.totalProjected?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Total Savings</p>
                    <p className="text-xl font-bold text-green-600">${result.totalSavings?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Cost Cuts Applied</p>
                    <p className="text-xl font-bold">{result.scenario?.costCuts?.length || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="max-h-60 space-y-1 overflow-y-auto">
              {result.projections?.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                  <span>Month {p.month}</span>
                  <span className="font-medium">${p.projectedSpend?.toLocaleString()}</span>
                  {p.savingsApplied > 0 && (
                    <span className="text-xs text-green-600">-${p.savingsApplied}/mo</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed p-8 text-center text-sm text-muted-foreground">
            <div>
              <BarChart3 className="mx-auto mb-2 h-8 w-8 opacity-50" />
              <p>Configure your assumptions and run the simulation to see projected savings.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
