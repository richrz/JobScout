"use client";

import { motion } from "framer-motion";

export function BackgroundMesh() {
  return (
    <div className="fixed inset-0 z-[-2] overflow-hidden pointer-events-none">
      {/* Primary Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.5, 0.3] 
        }}
        transition={{ 
          duration: 10, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute -top-[20%] left-[20%] w-[60vw] h-[60vw] rounded-full blur-[100px]"
        style={{
            background: "radial-gradient(circle, var(--gradient-1), transparent 70%)"
        }}
      />
      
      {/* Secondary Glow */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [-20, 20, -20]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
        className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full blur-[80px]"
        style={{
            background: "radial-gradient(circle, var(--gradient-2), transparent 70%)"
        }}
      />
    </div>
  );
}