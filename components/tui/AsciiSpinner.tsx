"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const FRAMES = ["|", "/", "─", "\\"];

interface AsciiSpinnerProps {
  className?: string;
  speed?: number;
}

export default function AsciiSpinner({ className, speed = 100 }: AsciiSpinnerProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % FRAMES.length), speed);
    return () => clearInterval(id);
  }, [speed]);

  return (
    <span className={cn("inline-block w-[1ch] text-center text-primary font-mono", className)}>
      {FRAMES[frame]}
    </span>
  );
}
