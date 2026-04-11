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
import { Loader2, ExternalLink, CircleCheck, CircleX } from "lucide-react";

export type Step =
  | { tag: "idle" }
  | { tag: "metadata"; donationAda: number }
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
  const [metadata, setMetadata] = useState("");

  const ada = parseFloat(amount);
  const isIdle = step.tag === "idle";
  const canProceed = connected && !isNaN(ada) && ada > 0 && isIdle;

  const handleNext = () => {
    if (!canProceed) return;
    setStep({ tag: "metadata", donationAda: ada });
  };

  const handleBuild = async (withMetadata: boolean) => {
    const donationAda = step.tag === "metadata" ? step.donationAda : ada;
    const lovelace = Math.round(donationAda * 1_000_000).toString();
    const metadataMsg = withMetadata ? metadata.trim() : "";

    // Step 1: Build
    setStep({ tag: "building", donationAda });
    let unsigned: UnsignedDonationTx;
    try {
      unsigned = await buildUnsignedDonationTx(wallet, lovelace, network, metadataMsg || undefined);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStep({ tag: "error", message, returnTo: "idle" });
      return;
    }

    // Step 2: Sign
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

    // Step 3: Show confirmation
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
    <div className="flex flex-col gap-4">
      <fieldset disabled={inputsDisabled} className={cn("flex flex-col gap-4 transition-opacity", inputsDisabled && "opacity-50 pointer-events-none")}>
        <div className="rounded-lg border bg-secondary/30 p-3 flex flex-col gap-3">
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-14 tabular-nums"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none">
              ada
            </span>
          </div>
        </div>
      </fieldset>

      {/* Idle: Next button */}
      {step.tag === "idle" && (
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          size="lg"
          className="w-full"
        >
          Next
        </Button>
      )}

      {/* Metadata step */}
      {step.tag === "metadata" && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-300">
          <textarea
            placeholder="Add a message (optional)"
            value={metadata}
            onChange={(e) => setMetadata(e.target.value)}
            maxLength={256}
            rows={2}
            className="rounded-lg border bg-secondary/30 px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
          />
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => { setMetadata(""); handleBuild(false); }}
            >
              Skip
            </Button>
            <Button
              className="flex-1"
              onClick={() => handleBuild(true)}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Building */}
      {step.tag === "building" && (
        <div className="flex items-center justify-center gap-3 rounded-lg border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground animate-in fade-in duration-300">
          <Loader2 className="size-4 animate-spin text-primary" />
        </div>
      )}

      {/* Signing */}
      {step.tag === "signing" && (
        <div className="flex items-center justify-center gap-3 rounded-lg border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground animate-in fade-in duration-300">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>Approve in wallet</span>
        </div>
      )}

      {/* Confirming */}
      {step.tag === "confirming" && (
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="rounded-lg border bg-secondary/30 p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Donation</span>
              <span className="font-medium">{step.donationAda} ada</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-medium">{(parseInt(step.signed.fee) / 1_000_000).toFixed(6)} ada</span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-medium">{(step.donationAda + parseInt(step.signed.fee) / 1_000_000).toFixed(6)} ada</span>
            </div>
          </div>
          <Button
            onClick={handleSubmit}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Submit
          </Button>
          <button
            onClick={() => setStep({ tag: "idle" })}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors self-center"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Submitting */}
      {step.tag === "submitting" && (
        <div className="flex flex-col gap-3 animate-in fade-in duration-300">
          <div className="rounded-lg border bg-secondary/30 p-4 flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Donation</span>
              <span className="font-medium">{step.donationAda} ada</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee</span>
              <span className="font-medium">{(parseInt(step.signed.fee) / 1_000_000).toFixed(6)} ada</span>
            </div>
          </div>
          <Button disabled size="lg" className="w-full bg-emerald-600 text-white">
            <Loader2 className="animate-spin" />
            Submitting...
          </Button>
        </div>
      )}

      {/* Success */}
      {step.tag === "success" && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2 text-emerald-400">
            <CircleCheck className="size-5" />
            <span className="text-lg font-semibold">{step.donationAda} ada donated</span>
          </div>
          <a
            href={`${explorerBase}/${step.txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-emerald-400 hover:underline"
          >
            View on explorer
            <ExternalLink className="size-3" />
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setStep({ tag: "idle" }); setAmount(""); setMetadata(""); }}
            className="mt-1 text-muted-foreground"
          >
            Donate again
          </Button>
        </div>
      )}

      {/* Error */}
      {step.tag === "error" && (
        <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-300">
            <CircleX className="mt-0.5 size-4 shrink-0" />
            <span>{step.message}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRetry}
            className="self-center"
          >
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}
