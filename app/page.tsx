"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useWallet } from "@meshsdk/react";
import { useNetwork } from "./providers";
import { CardanoWallet } from "@meshsdk/react";
import { Providers } from "./providers";
import NetworkToggle from "@/components/NetworkToggle";
import WalletInfo from "@/components/WalletInfo";
import DonationForm from "@/components/DonationForm";
import DonationStepper from "@/components/DonationStepper";
import AsciiHeader from "@/components/tui/AsciiHeader";
import GithubFooter from "@/components/tui/GithubFooter";
import NoticeBanner from "@/components/tui/NoticeBanner";
import type { Step } from "@/components/DonationForm";
import type { Notice } from "@/components/tui/NoticeBanner";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

function getStepIndex(connected: boolean, step: Step): number {
  if (!connected && step.tag !== "success") return 0;
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
  const { network } = useNetwork();
  const [step, setStep] = useState<Step>({ tag: "idle" });
  const [resetKey, setResetKey] = useState(0);
  const [notices, setNotices] = useState<Notice[]>([]);
  const nextNoticeId = useRef(0);

  const stepRef = useRef(step);
  stepRef.current = step;

  const prevConnected = useRef(connected);
  const prevNetwork = useRef(network);

  const addNotice = useCallback((message: string) => {
    setNotices((prev) => [
      ...prev,
      { id: nextNoticeId.current++, message, createdAt: Date.now() },
    ]);
  }, []);

  const dismissNotice = useCallback((id: number) => {
    setNotices((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Auto-dismiss notices after 8 seconds
  useEffect(() => {
    if (notices.length === 0) return;
    const timer = setTimeout(() => {
      setNotices((prev) => prev.filter((n) => Date.now() - n.createdAt < 8000));
    }, 8000);
    return () => clearTimeout(timer);
  }, [notices]);

  // Handle wallet disconnect
  useEffect(() => {
    const wasConnected = prevConnected.current;
    prevConnected.current = connected;

    if (wasConnected && !connected) {
      const currentStep = stepRef.current;
      if (currentStep.tag === "success") return;
      if (currentStep.tag !== "idle") {
        addNotice("Wallet disconnected \u2014 donation progress reset");
      }
      setStep({ tag: "idle" });
      setResetKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  // Handle network change
  useEffect(() => {
    const wasNetwork = prevNetwork.current;
    prevNetwork.current = network;

    if (wasNetwork !== network) {
      const currentStep = stepRef.current;
      if (currentStep.tag === "success") return;
      if (currentStep.tag !== "idle") {
        setStep({ tag: "idle" });
        setResetKey((k) => k + 1);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [network]);

  // Wrap setStep to clear notices when starting a new action
  const handleSetStep = useCallback((newStep: Step) => {
    if (newStep.tag !== "idle" && newStep.tag !== "error") {
      setNotices([]);
    }
    setStep(newStep);
  }, []);

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
            <div className="flex items-center gap-2">
              <NetworkToggle />
              <div className="[&_button]:border [&_button]:border-primary/30 [&_button]:text-sm [&_button]:font-mono">
                <CardanoWallet isDark={true} />
              </div>
            </div>
          </div>

          <DonationStepper currentIndex={stepIndex} isError={step.tag === "error"} />
          <WalletInfo addNotice={addNotice} />
          <NoticeBanner notices={notices} onDismiss={dismissNotice} />
          <DonationForm key={resetKey} step={step} setStep={handleSetStep} />
        </CardContent>
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
