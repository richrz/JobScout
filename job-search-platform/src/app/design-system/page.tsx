"use client";

import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AnimatedStat } from "@/components/ui/animated-stat";
import { TrendChart } from "@/components/charts/TrendChart";
import { Separator } from "@/components/ui/separator";

export default function DesignSystemPage() {
  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gradient-primary">Design System</h1>
        <p className="text-muted-foreground text-lg">
          The "JobScout Prism" visual language. Adaptive, motion-rich, and glass-textured.
        </p>
      </div>

      <Separator />

      {/* Colors & Gradients */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">1. Colors & Surfaces</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="h-32 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-background border border-border shadow-sm" />
            <span className="text-xs font-mono">Background</span>
          </GlassCard>
          <GlassCard className="h-32 flex flex-col items-center justify-center gap-2 bg-slate-950">
            <div className="w-12 h-12 rounded-full bg-card border border-border shadow-sm" />
            <span className="text-xs font-mono">Card Surface</span>
          </GlassCard>
          <GlassCard className="h-32 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/30" />
            <span className="text-xs font-mono">Primary</span>
          </GlassCard>
          <GlassCard className="h-32 flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-secondary border border-border" />
            <span className="text-xs font-mono">Secondary</span>
          </GlassCard>
        </div>
        
        <h3 className="text-lg font-medium pt-4">Data Accents</h3>
        <div className="flex gap-4 flex-wrap">
             {['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'].map((chart, i) => (
                 <div key={i} className="flex flex-col items-center gap-2">
                     <div 
                        className="w-16 h-16 rounded-xl shadow-lg" 
                        style={{ backgroundColor: `hsl(var(--${chart}))` }}
                     />
                     <span className="text-xs font-mono">--{chart}</span>
                 </div>
             ))}
        </div>
      </section>

      <Separator />

      {/* Typography */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">2. Typography</h2>
        <GlassCard className="space-y-6 p-8">
            <h1 className="text-5xl font-bold tracking-tight">Heading 1 (Display)</h1>
            <h2 className="text-4xl font-bold tracking-tight">Heading 2 (Page Title)</h2>
            <h3 className="text-2xl font-semibold tracking-tight">Heading 3 (Section)</h3>
            <h4 className="text-xl font-medium tracking-tight">Heading 4 (Card Title)</h4>
            <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                Body text (Muted). Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
            </p>
            <p className="text-sm font-medium">Small Medium Text (Labels)</p>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Overline / Caption</p>
        </GlassCard>
      </section>

      <Separator />

      {/* Buttons */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">3. Interactive Elements</h2>
        <div className="grid md:grid-cols-2 gap-8">
            <GlassCard className="space-y-4">
                <h3 className="text-lg font-medium">Buttons</h3>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button>Default</Button>
                    <Button variant="secondary">Secondary</Button>
                    <Button variant="outline">Outline</Button>
                    <Button variant="ghost">Ghost</Button>
                    <Button variant="destructive">Destructive</Button>
                    <Button variant="glow">Glow Effect</Button>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                    <Button size="sm">Small</Button>
                    <Button size="default">Default</Button>
                    <Button size="lg">Large</Button>
                </div>
            </GlassCard>

            <GlassCard className="space-y-4">
                <h3 className="text-lg font-medium">Inputs & Badges</h3>
                <div className="space-y-3 max-w-sm">
                    <Input placeholder="Default Input..." />
                    <Input placeholder="Disabled..." disabled />
                </div>
                <div className="flex flex-wrap gap-2 pt-4">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="glass">Glass</Badge>
                    <Badge variant="success">Success</Badge>
                    <Badge variant="warning">Warning</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                </div>
            </GlassCard>
        </div>
      </section>

      <Separator />

      {/* Cards & Motion */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">4. Cards & Motion</h2>
        <div className="grid md:grid-cols-3 gap-6">
            <GlassCard variant="default">
                <h4 className="font-semibold mb-2">Default Card</h4>
                <p className="text-sm text-muted-foreground">Standard glass card with subtle border and blur.</p>
            </GlassCard>
            <GlassCard variant="highlight">
                <h4 className="font-semibold mb-2">Highlight Card</h4>
                <p className="text-sm text-muted-foreground">Slightly tinted background for emphasis.</p>
            </GlassCard>
            <GlassCard variant="interactive">
                <h4 className="font-semibold mb-2">Interactive Card</h4>
                <p className="text-sm text-muted-foreground">Hover over me! Cursor pointer enabled.</p>
            </GlassCard>
        </div>
      </section>

      <Separator />

      {/* Data Vis */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">5. Data Visualization</h2>
        <div className="grid md:grid-cols-2 gap-6">
             <GlassCard className="flex flex-col items-center justify-center gap-2 py-10">
                 <h3 className="text-muted-foreground font-medium">Animated Counter</h3>
                 <div className="text-5xl font-bold tracking-tighter text-gradient-primary">
                     <AnimatedStat value={1234} prefix="$" />
                 </div>
             </GlassCard>
             <TrendChart />
        </div>
      </section>

    </div>
  );
}