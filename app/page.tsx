"use client";

import { useState } from "react";
import { useWallet } from "@meshsdk/react";
import { CardanoWallet } from "@meshsdk/react";
import { Providers } from "./providers";
import NetworkToggle from "@/components/NetworkToggle";
import WalletInfo from "@/components/WalletInfo";
import DonationForm from "@/components/DonationForm";
import DonationStepper from "@/components/DonationStepper";
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
    case "metadata": return 2;
    case "building":
    case "signing": return 3;
    case "confirming": return 4;
    case "submitting": return 5;
    case "success": return 6;
    case "error": return step.returnTo === "confirming" ? 5 : 3;
  }
}

function App() {
  const { connected } = useWallet();
  const [step, setStep] = useState<Step>({ tag: "idle" });

  const stepIndex = getStepIndex(connected, step);

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card>
        <CardContent className="flex flex-col gap-5 pt-6">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">Treasury Donator</h1>
            <div className="[&_button]:rounded-md [&_button]:text-sm overflow-hidden">
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
