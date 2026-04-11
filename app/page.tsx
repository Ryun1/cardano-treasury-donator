"use client";

import { useState } from "react";
import { useWallet } from "@meshsdk/react";
import { CardanoWallet } from "@meshsdk/react";
import { Providers } from "./providers";
import NetworkToggle from "@/components/NetworkToggle";
import WalletInfo from "@/components/WalletInfo";
import DonationForm from "@/components/DonationForm";
import DonationStepper from "@/components/DonationStepper";
import AsciiHeader from "@/components/tui/AsciiHeader";
import GithubFooter from "@/components/tui/GithubFooter";
import type { Step } from "@/components/DonationForm";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function getStepIndex(connected: boolean, step: Step): number {
  if (!connected) return 0;
  switch (step.tag) {
    case "idle": return 1;
    case "building":
    case "signing": return 2;
    case "confirming": return 3;
    case "submitting": return 4;
    case "success": return 5;
    case "error": return step.returnTo === "confirming" ? 4 : 2;
  }
}

function App() {
  const { connected } = useWallet();
  const [step, setStep] = useState<Step>({ tag: "idle" });

  const stepIndex = getStepIndex(connected, step);

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <AsciiHeader className="mb-4" />
      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-semibold font-mono uppercase tracking-wider text-primary">
              <span className="text-muted-foreground">&gt;</span> Treasury Donator<span className="animate-[blink-cursor_1s_step-end_infinite] text-primary ml-0.5">_</span>
            </h1>
            <div className="[&_button]:border [&_button]:border-primary/30 [&_button]:text-sm [&_button]:font-mono">
              <CardanoWallet isDark={true} />
            </div>
          </div>

          <DonationStepper currentIndex={stepIndex} isError={step.tag === "error"} />
          <WalletInfo />
          <DonationForm step={step} setStep={setStep} />
        </CardContent>

        <CardFooter className="justify-start">
          <NetworkToggle />
        </CardFooter>
      </Card>
      <GithubFooter />
    </main>
  );
}

export default function Page() {
  return (
    <Providers>
      <App />
    </Providers>
  );
}
