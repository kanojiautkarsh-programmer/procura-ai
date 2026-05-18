'use client';

interface SpendChartProps {
  historical: { date: string; amount: number }[];
  forecast: { date: string; amount: number; isForecast?: boolean }[];
}

export function SpendChart({ historical, forecast }: SpendChartProps) {
  const allData = [
    ...historical.map((d) => ({ ...d, type: 'actual' as const })),
    ...forecast.map((d) => ({ ...d, type: 'forecast' as const })),
  ];

  const maxAmount = Math.max(...allData.map((d) => d.amount), 1);
  const chartHeight = 240;

  return (
    <div className="space-y-4">
      <div className="relative" style={{ height: chartHeight }}>
        <div className="absolute bottom-0 left-0 right-0 top-0 flex items-end gap-1">
          {allData.map((item, i) => {
            const height = (item.amount / maxAmount) * (chartHeight - 30);
            const isForecast = item.type === 'forecast';
            return (
              <div
                key={i}
                className="group relative flex flex-1 flex-col items-center"
                style={{ height: chartHeight }}
              >
                <div
                  className={`mt-auto w-full rounded-t transition-all hover:opacity-80 ${
                    isForecast
                      ? 'bg-primary/40 border-t-2 border-dashed border-primary'
                      : 'bg-primary'
                  }`}
                  style={{ height: `${height}px` }}
                />
                <div className="absolute -top-6 hidden whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs shadow group-hover:block">
                  ${item.amount.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        {allData.filter((_, i) => i % Math.max(1, Math.floor(allData.length / 6)) === 0).map((item, i) => (
          <span key={i}>{item.date}</span>
        ))}
      </div>

      <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded bg-primary" />
          <span>Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-6 rounded bg-primary/40 border-t-2 border-dashed border-primary" />
          <span>Forecast</span>
        </div>
      </div>
    </div>
  );
}
