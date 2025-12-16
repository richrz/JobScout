"use client";

import { useTheme } from "next-themes";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { GlassCard } from "@/components/ui/glass-card";

const data = [
  { name: "Mon", apps: 2, matches: 4 },
  { name: "Tue", apps: 5, matches: 3 },
  { name: "Wed", apps: 3, matches: 7 },
  { name: "Thu", apps: 8, matches: 5 },
  { name: "Fri", apps: 6, matches: 9 },
  { name: "Sat", apps: 1, matches: 2 },
  { name: "Sun", apps: 4, matches: 6 },
];

export function TrendChart() {
  const { theme } = useTheme();
  
  // These should match the CSS variables, but Recharts needs hex strings usually or ID references
  // We'll use CSS variable references via `url(#id)` for gradients
  
  return (
    <GlassCard className="h-full w-full p-6 flex flex-col" variant="default">
      <div className="mb-2 shrink-0">
        <h3 className="text-lg font-semibold flex items-center gap-2">
            Weekly Activity
        </h3>
        <p className="text-xs text-muted-foreground">Applications vs. High Matches</p>
      </div>
      
      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorMatches" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.5}/>
                <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ 
                  backgroundColor: 'hsla(var(--card), 0.9)', 
                  backdropFilter: 'blur(12px)',
                  borderColor: 'hsla(var(--border))',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                  color: 'hsl(var(--foreground))'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Area 
              type="monotone" 
              dataKey="apps" 
              name="Applications"
              stroke="hsl(var(--chart-2))" 
              fillOpacity={1} 
              fill="url(#colorApps)" 
              strokeWidth={3}
            />
            <Area 
              type="monotone" 
              dataKey="matches" 
              name="High Matches"
              stroke="hsl(var(--chart-4))" 
              fillOpacity={1} 
              fill="url(#colorMatches)" 
              strokeWidth={3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
