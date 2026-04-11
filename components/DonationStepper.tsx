"use client";

import { cn } from "@/lib/utils";
import {
  Wallet,
  Coins,
  FileText,
  Pen,
  Check,
  Send,
  ExternalLink,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StepDef {
  label: string;
  icon: LucideIcon;
}

const STEPS: StepDef[] = [
  { label: "Connect", icon: Wallet },
  { label: "Amount", icon: Coins },
  { label: "Metadata", icon: FileText },
  { label: "Sign", icon: Pen },
  { label: "Confirm", icon: Check },
  { label: "Submit", icon: Send },
  { label: "Done", icon: ExternalLink },
];

interface DonationStepperProps {
  currentIndex: number;
  isError?: boolean;
  className?: string;
}

export default function DonationStepper({
  currentIndex,
  isError = false,
  className,
}: DonationStepperProps) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div className="flex w-full items-center justify-between px-1">
        {STEPS.map((step, i) => {
          const completed = i < currentIndex;
          const active = i === currentIndex;
          const future = i > currentIndex;

          return (
            <div key={step.label} className="flex items-center flex-1 last:flex-none">
              {/* Dot */}
              <div className="relative flex items-center justify-center">
                <div
                  className={cn(
                    "flex size-[10px] items-center justify-center rounded-full transition-all duration-300",
                    completed && "bg-primary/60",
                    active && !isError && "bg-primary animate-[step-pulse_2s_ease-in-out_infinite]",
                    active && isError && "bg-destructive animate-[step-pulse-error_2s_ease-in-out_infinite]",
                    future && "bg-muted/50 ring-1 ring-muted"
                  )}
                >
                  {completed && (
                    <Check className="size-[7px] text-primary-foreground" strokeWidth={3} />
                  )}
                </div>
              </div>

              {/* Connecting line */}
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-px flex-1 mx-1 transition-colors duration-300",
                    i < currentIndex ? "bg-primary/40" : "bg-muted/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Active step label */}
      {currentIndex >= 0 && currentIndex < STEPS.length && (
        <span
          className={cn(
            "text-[11px] font-medium tracking-wide transition-colors duration-300",
            isError ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {STEPS[currentIndex].label}
        </span>
      )}
    </div>
  );
}
