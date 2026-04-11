"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const HEADER = `┌──────────────────────────────────┐
│  CARDANO TREASURY DONATOR  ₳    │
└──────────────────────────────────┘`;

interface AsciiHeaderProps {
  className?: string;
}

export default function AsciiHeader({ className }: AsciiHeaderProps) {
  const [visible, setVisible] = useState(0);
  const total = HEADER.length;

  useEffect(() => {
    if (visible >= total) return;
    const id = setTimeout(() => setVisible((v) => Math.min(v + 3, total)), 12);
    return () => clearTimeout(id);
  }, [visible, total]);

  return (
    <pre
      className={cn(
        "text-primary text-xs sm:text-sm font-mono leading-tight text-center select-none overflow-hidden",
        className
      )}
      aria-label="Cardano Treasury Donator"
    >
      {HEADER.slice(0, visible)}
      {visible < total && (
        <span className="text-primary">█</span>
      )}
    </pre>
  );
}
