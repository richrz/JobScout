"use client";

import { cn } from "@/lib/utils";
import { motion, HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  glowColor?: string; // e.g., "hsla(var(--primary), 0.5)"
  variant?: "default" | "highlight" | "interactive";
}

export function GlassCard({
  children,
  className,
  hoverEffect = true,
  glowColor,
  variant = "default",
  style,
  ...props
}: GlassCardProps) {
  
  // Dynamic border/shadow based on variant
  const getVariantStyles = () => {
    switch(variant) {
      case "highlight":
        return "bg-[hsla(var(--primary),0.05)] border-[hsla(var(--primary),0.2)]";
      case "interactive":
        return "cursor-pointer hover:bg-[var(--glass-bg)]";
      default:
        return "bg-[var(--glass-bg)] border-[var(--glass-border)]";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        hoverEffect
          ? {
              y: -4,
              boxShadow: `0 10px 40px -10px ${glowColor || "hsla(var(--primary), 0.2)"}`,
              borderColor: glowColor || "hsla(var(--primary), 0.3)",
            }
          : undefined
      }
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className={cn(
        "relative overflow-hidden rounded-2xl border backdrop-blur-xl shadow-sm transition-colors",
        getVariantStyles(),
        className
      )}
      style={style}
      {...props}
    >
      {/* Glossy gradient overlay - lighter in light mode via mix-blend-mode */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 pointer-events-none mix-blend-overlay" />
      
      {/* Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}