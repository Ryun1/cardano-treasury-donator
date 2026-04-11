"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
  cursor?: boolean;
}

export default function TypewriterText({
  text,
  speed = 40,
  className,
  cursor = true,
}: TypewriterTextProps) {
  const [len, setLen] = useState(0);

  useEffect(() => {
    setLen(0);
  }, [text]);

  useEffect(() => {
    if (len >= text.length) return;
    const id = setTimeout(() => setLen((l) => l + 1), speed);
    return () => clearTimeout(id);
  }, [len, text, speed]);

  return (
    <span className={cn("font-mono", className)}>
      {text.slice(0, len)}
      {cursor && (
        <span className="animate-[blink-cursor_1s_step-end_infinite] text-primary">
          █
        </span>
      )}
    </span>
  );
}
