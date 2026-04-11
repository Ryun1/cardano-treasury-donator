"use client";

import { cn } from "@/lib/utils";

interface StepDef {
  label: string;
  short: string;
}

const STEPS: StepDef[] = [
  { label: "Connect", short: "CON" },
  { label: "Amount", short: "AMT" },
  { label: "Sign", short: "SGN" },
  { label: "Confirm", short: "CFM" },
  { label: "Submit", short: "SUB" },
  { label: "Done", short: "OK" },
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
  const filled = Math.max(0, currentIndex);
  const total = STEPS.length;
  const barLen = 20;
  const filledLen = Math.round((filled / (total - 1)) * barLen);

  return (
    <div className={cn("flex flex-col gap-2 font-mono", className)}>
      {/* ASCII progress bar */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">[</span>
        <span className={cn("tracking-[0.15em]", isError ? "text-destructive" : "text-primary")}>
          {"█".repeat(filledLen)}
          {"░".repeat(barLen - filledLen)}
        </span>
        <span className="text-muted-foreground">]</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {filled + 1}/{total}
        </span>
      </div>

      {/* Step labels */}
      <div className="hidden sm:flex items-center gap-0 text-[10px] tracking-wider overflow-hidden">
        {STEPS.map((step, i) => {
          const completed = i < currentIndex;
          const active = i === currentIndex;

          return (
            <div key={step.label} className="flex items-center">
              <span
                className={cn(
                  "transition-colors duration-200",
                  completed && "text-primary/60",
                  active && !isError && "text-primary font-bold",
                  active && isError && "text-destructive font-bold",
                  !completed && !active && "text-muted-foreground/40"
                )}
              >
                {completed ? "[x]" : active ? "[>]" : "[ ]"}
                <span className="ml-0.5">{step.short}</span>
              </span>
              {i < STEPS.length - 1 && (
                <span className={cn(
                  "mx-1",
                  i < currentIndex ? "text-primary/40" : "text-muted-foreground/20"
                )}>─</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Active label on mobile */}
      <div className="sm:hidden text-xs text-center">
        <span className={cn(
          "tracking-wide",
          isError ? "text-destructive" : "text-muted-foreground"
        )}>
          {currentIndex >= 0 && currentIndex < STEPS.length && (
            <>{"> "}{STEPS[currentIndex].label}<span className="animate-[blink-cursor_1s_step-end_infinite] text-primary ml-0.5">_</span></>
          )}
        </span>
      </div>
    </div>
  );
}
