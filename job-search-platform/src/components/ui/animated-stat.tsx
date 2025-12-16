"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

interface AnimatedStatProps {
  value: number;
  suffix?: string;
  prefix?: string;
  delay?: number;
}

export function AnimatedStat({ value, suffix = "", prefix = "", delay = 0 }: AnimatedStatProps) {
  // Spring physics for smooth counting
  let springValue = useSpring(0, { 
    stiffness: 100, 
    damping: 30, 
    restDelta: 0.001 
  });
  
  const displayValue = useTransform(springValue, (latest) =>
    Math.round(latest).toLocaleString()
  );
  
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    // Add a small delay if requested to stagger animations
    const timer = setTimeout(() => {
        springValue.set(value);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [value, springValue, delay]);

  useEffect(() => {
    return displayValue.on("change", (latest) => {
      setDisplay(latest);
    });
  }, [displayValue]);

  return (
    <span className="font-mono tracking-tight tabular-nums inline-block">
      {prefix}{display}{suffix}
    </span>
  );
}