"use client";

import { useState } from "react";
import { useWallet } from "@meshsdk/react";
import { useNetwork } from "@/app/providers";
import {
  buildUnsignedDonationTx,
  signDonationTx,
  submitDonationTx,
} from "@/lib/build-donation-tx";
import type { UnsignedDonationTx, SignedDonationTx } from "@/lib/build-donation-tx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import AsciiSpinner from "@/components/tui/AsciiSpinner";
import TypewriterText from "@/components/tui/TypewriterText";
import { ExternalLink } from "lucide-react";

export type Step =
  | { tag: "idle" }
  | { tag: "building"; donationAda: number }
  | { tag: "signing"; donationAda: number; unsigned: UnsignedDonationTx }
  | { tag: "confirming"; donationAda: number; signed: SignedDonationTx }
  | { tag: "submitting"; donationAda: number; signed: SignedDonationTx }
  | { tag: "success"; donationAda: number; txHash: string }
  | { tag: "error"; message: string; returnTo: "idle" | "confirming"; signed?: SignedDonationTx; donationAda?: number };

interface DonationFormProps {
  step: Step;
  setStep: (step: Step) => void;
}

export default function DonationForm({ step, setStep }: DonationFormProps) {
  const { wallet, connected } = useWallet();
  const { network } = useNetwork();
  const [amount, setAmount] = useState("");

  const ada = parseFloat(amount);
  const isIdle = step.tag === "idle";
  const canProceed = connected && !isNaN(ada) && ada > 0 && isIdle;

  const handleBuild = async () => {
    if (!canProceed) return;
    const donationAda = ada;
    const lovelace = Math.round(donationAda * 1_000_000).toString();

    setStep({ tag: "building", donationAda });
    let unsigned: UnsignedDonationTx;
    try {
      unsigned = await buildUnsignedDonationTx(wallet, lovelace, network);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStep({ tag: "error", message, returnTo: "idle" });
      return;
    }

    setStep({ tag: "signing", donationAda, unsigned });
    let signed: SignedDonationTx;
    try {
      signed = await signDonationTx(wallet, unsigned);
    } catch (err) {
      const raw = err instanceof Error ? err.message : String(err);
      const message = /user|cancel|decline|refuse|reject/i.test(raw)
        ? "Transaction signing was cancelled"
        : raw;
      setStep({ tag: "error", message, returnTo: "idle" });
      return;
    }

    setStep({ tag: "confirming", donationAda, signed });
  };

  const handleSubmit = async () => {
    if (step.tag !== "confirming") return;
    const { donationAda, signed } = step;

    setStep({ tag: "submitting", donationAda, signed });
    try {
      const txHash = await submitDonationTx(wallet, signed);
      setStep({ tag: "success", donationAda, txHash });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStep({ tag: "error", message, returnTo: "confirming", signed, donationAda });
    }
  };

  const handleRetry = () => {
    if (step.tag !== "error") return;
    if (step.returnTo === "confirming" && step.signed && step.donationAda) {
      setStep({ tag: "confirming", donationAda: step.donationAda, signed: step.signed });
    } else {
      setStep({ tag: "idle" });
    }
  };

  const explorerBase =
    network === "mainnet"
      ? "https://cexplorer.io/tx"
      : "https://preview.cexplorer.io/tx";

  const inputsDisabled = !isIdle;

  return (
    <div className="flex flex-col gap-4 font-mono">
      <fieldset disabled={inputsDisabled} className={cn("flex flex-col gap-4 transition-opacity", inputsDisabled && "opacity-50 pointer-events-none")}>
        <div className="border border-primary/20 bg-secondary/30 p-3 flex flex-col gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/60 pointer-events-none select-none text-sm">&gt;</span>
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="0.000000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 pr-14 tabular-nums"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none">
              ada
            </span>
          </div>
        </div>
      </fieldset>

      {/* Idle: Donate button */}
      {step.tag === "idle" && (
        <Button
          onClick={handleBuild}
          disabled={!canProceed}
          size="lg"
          className="w-full"
        >
          [ Donate ]
        </Button>
      )}

      {/* Building */}
      {step.tag === "building" && (
        <div className="flex items-center justify-center gap-3 border border-primary/20 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground animate-in fade-in duration-300">
          <AsciiSpinner />
          <TypewriterText text="Building transaction..." />
        </div>
      )}

      {/* Signing */}
      {step.tag === "signing" && (
        <div className="flex items-center justify-center gap-3 border border-primary/20 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground animate-in fade-in duration-300">
          <AsciiSpinner />
          <TypewriterText text="Approve in wallet..." />
        </div>
      )}

      {/* Confirming */}
      {step.tag === "confirming" && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="border border-primary/20 bg-secondary/30 p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">donation</span>
              <span className="font-medium tabular-nums">{step.donationAda} ada</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">fee</span>
              <span className="font-medium tabular-nums">{(parseInt(step.signed.fee) / 1_000_000).toFixed(6)} ada</span>
            </div>
            <div className="text-primary/30 text-xs">────────────────────────────</div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">total</span>
              <span className="font-medium tabular-nums">{(step.donationAda + parseInt(step.signed.fee) / 1_000_000).toFixed(6)} ada</span>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full"
          >
            [ Submit ]
          </Button>
          <button
            onClick={() => setStep({ tag: "idle" })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors self-center font-mono"
          >
            cancel
          </button>
        </div>
      )}

      {/* Submitting */}
      {step.tag === "submitting" && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-300">
          <div className="border border-primary/20 bg-secondary/30 p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">donation</span>
              <span className="font-medium tabular-nums">{step.donationAda} ada</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">fee</span>
              <span className="font-medium tabular-nums">{(parseInt(step.signed.fee) / 1_000_000).toFixed(6)} ada</span>
            </div>
          </div>
          <Button disabled size="lg" className="w-full">
            <AsciiSpinner />
            Submitting...
          </Button>
        </div>
      )}

      {/* Success */}
      {step.tag === "success" && (
        <div className="flex flex-col items-center gap-3 border border-primary/30 bg-primary/5 px-4 py-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2 text-primary">
            <span className="font-bold">[OK]</span>
            <span className="text-lg font-semibold">{step.donationAda} ada donated</span>
          </div>
          <a
            href={`${explorerBase}/${step.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            View on explorer
            <ExternalLink className="size-3" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStep({ tag: "idle" }); setAmount(""); }}
            className="mt-1 text-muted-foreground"
          >
            [ Donate again ]
          </Button>
        </div>
      )}

      {/* Error */}
      {step.tag === "error" && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <div className="flex items-start gap-2.5 border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <span className="font-bold shrink-0">[ERR]</span>
            <span>{step.message}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            className="self-center"
          >
            [ Retry ]
          </Button>
        </div>
      )}
    </div>
  );
}
