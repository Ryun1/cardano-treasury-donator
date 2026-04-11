"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@meshsdk/react";
import { useNetwork } from "@/app/providers";
import { buildDonationTx } from "@/lib/build-donation-tx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader2, ExternalLink, CircleCheck, CircleX, Wallet } from "lucide-react";

type Status =
  | { type: "idle" }
  | { type: "loading"; message: string }
  | { type: "success"; txHash: string; amount: number }
  | { type: "error"; message: string };

const PRESETS = [5, 10, 25, 50, 100];

export default function DonationForm() {
  const { wallet, connected } = useWallet();
  const { network } = useNetwork();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [confirming, setConfirming] = useState(false);

  const ada = parseFloat(amount);
  const canDonate = connected && !isNaN(ada) && ada > 0 && status.type !== "loading";

  useEffect(() => setConfirming(false), [amount]);

  const handleDonate = async () => {
    if (!canDonate) return;

    const lovelace = Math.round(ada * 1_000_000).toString();

    try {
      setConfirming(false);
      setStatus({ type: "loading", message: "Building transaction..." });
      const txHash = await buildDonationTx(wallet, lovelace, network);
      setStatus({ type: "success", txHash, amount: ada });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setStatus({ type: "error", message });
    }
  };

  const explorerBase =
    network === "mainnet"
      ? "https://cexplorer.io/tx"
      : "https://preview.cexplorer.io/tx";

  const activePreset = PRESETS.includes(ada) ? ada : null;
  const isLoading = status.type === "loading";

  return (
    <div className="flex flex-col gap-4">
      <fieldset disabled={isLoading} className={cn("flex flex-col gap-4 transition-opacity", isLoading && "opacity-50 pointer-events-none")}>
        <div className="rounded-lg border bg-secondary/30 p-3 flex flex-col gap-3">
          <div className="grid grid-cols-3 min-[460px]:grid-cols-5 gap-1.5 mb-1">
            {PRESETS.map((preset) => (
              <Button
                key={preset}
                variant={activePreset === preset ? "default" : "secondary"}
                size="sm"
                onClick={() => setAmount(String(preset))}
                className={cn(
                  "w-full tabular-nums relative",
                  activePreset === preset && "ring-2 ring-primary/30"
                )}
              >
                {preset} ADA
                {preset === 10 && (
                  <span className="absolute -bottom-3.5 left-1/2 -translate-x-1/2 text-[9px] font-normal text-primary/70 leading-none">popular</span>
                )}
              </Button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="relative">
            <Input
              type="number"
              min="0"
              step="any"
              placeholder="Custom amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pr-14 tabular-nums"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none select-none">
              ADA
            </span>
          </div>
        </div>

        {!connected && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Wallet className="size-3" />
            Connect wallet to donate
          </p>
        )}
      </fieldset>

      {confirming ? (
        <div className="flex flex-col gap-2 animate-in fade-in duration-200">
          <Button
            onClick={handleDonate}
            size="lg"
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
          >
            Confirm {ada} ADA Donation
          </Button>
          <button
            onClick={() => setConfirming(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors self-center"
          >
            Cancel
          </button>
        </div>
      ) : (
        <Button
          onClick={() => setConfirming(true)}
          disabled={!canDonate}
          size="lg"
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Donating...
            </>
          ) : (
            "Donate"
          )}
        </Button>
      )}

      {isLoading && (
        <div className="flex items-center gap-3 rounded-lg border bg-secondary/50 px-4 py-3 text-sm text-muted-foreground animate-in fade-in duration-300">
          <Loader2 className="size-4 animate-spin text-primary" />
          <span>{status.message}</span>
        </div>
      )}

      {status.type === "success" && (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-5 text-center animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2 text-emerald-400">
            <CircleCheck className="size-5" />
            <span className="text-lg font-semibold">Thank you!</span>
          </div>
          <p className="text-sm text-emerald-300">
            You donated {status.amount} ADA to the Cardano treasury
          </p>
          <a
            href={`${explorerBase}/${status.txHash}`}
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
            onClick={() => { setStatus({ type: "idle" }); setAmount(""); }}
            className="mt-1 text-muted-foreground"
          >
            Donate again
          </Button>
        </div>
      )}

      {status.type === "error" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-red-300 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <CircleX className="mt-0.5 size-4 shrink-0" />
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
}
