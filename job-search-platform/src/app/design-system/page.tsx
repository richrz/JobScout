'use client';

import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/ui/glass-card';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen w-full bg-background p-10 space-y-20">
      <header className="space-y-4">
        <h1 className="h1 text-gradient-primary">JobScout Prism Design System</h1>
        <p className="p max-w-2xl text-muted-foreground">
          This is the visual source of truth for the 'Deep Space' theme. It showcases the typography, color palette, and core components like GlassCards and Buttons.
        </p>
      </header>

      {/* Typography Section */}
      <section className="space-y-6">
        <h2 className="h2 text-cyan-400">Typography</h2>
        <div className="space-y-4 border border-border/50 p-6 rounded-2xl bg-card/20">
          <h1 className="h1">Display Heading (H1)</h1>
          <h2 className="h2">Section Heading (H2)</h2>
          <h3 className="h3">Subsection Heading (H3)</h3>
          <p className="p">Body Text: The quick brown fox jumps over the lazy dog. Localized job search just got smarter.</p>
          <p className="small text-muted-foreground">Small / Muted Text</p>
          <p className="text-tiny text-electric-green">Tiny / Label Text</p>
        </div>
      </section>

      {/* Colors Section */}
      <section className="space-y-6">
        <h2 className="h2 text-cyan-400">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Deep Space */}
          <div className="space-y-2">
            <div className="h-20 w-full rounded-xl bg-deep-space border border-border"></div>
            <p className="small">Deep Space (Base)</p>
          </div>
          {/* Electric Green */}
          <div className="space-y-2">
            <div className="h-20 w-full rounded-xl bg-electric-green shadow-[0_0_20px_rgba(53,227,117,0.4)]"></div>
            <p className="small">Electric Green (Brand)</p>
          </div>
          {/* Muted Green */}
          <div className="space-y-2">
            <div className="h-20 w-full rounded-xl bg-electric-green-dim"></div>
            <p className="small">Electric Green (Dim)</p>
          </div>
          {/* Frost */}
          <div className="space-y-2">
            <div className="h-20 w-full rounded-xl bg-frost backdrop-blur-md border border-frost-border"></div>
            <p className="small">Frost Glass</p>
          </div>
        </div>
      </section>

      {/* Components Section */}
      <section className="space-y-6">
        <h2 className="h2 text-cyan-400">Core Components</h2>

        {/* Buttons */}
        <div className="space-y-4">
          <h3 className="h3">Buttons</h3>
          <div className="flex flex-wrap gap-4">
            <Button variant="default">Primary Action</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="glow">Glow Effect</Button>
            <Button variant="highlight">Highlight</Button>
          </div>
        </div>

        {/* Glass Cards */}
        <div className="space-y-4 pt-8">
          <h3 className="h3">Glass Cards</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <GlassCard className="p-6">
              <h4 className="font-bold text-lg mb-2">Default Glass</h4>
              <p className="text-sm text-muted-foreground">Standard backdrop blur for content containers.</p>
            </GlassCard>

            <GlassCard variant="highlight" className="p-6">
              <h4 className="font-bold text-lg mb-2 text-electric-green">Highlight Variant</h4>
              <p className="text-sm text-muted-foreground">Used for featured items or active states.</p>
            </GlassCard>

            <GlassCard variant="interactive" className="p-6" hoverEffect={true}>
              <h4 className="font-bold text-lg mb-2">Interactive</h4>
              <p className="text-sm text-muted-foreground">Hover over me! I react to cursor movement.</p>
            </GlassCard>
          </div>
        </div>
      </section>
    </div>
  );
}