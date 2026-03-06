"use client";

import { useState } from "react";
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
  | { type: "success"; txHash: string }
  | { type: "error"; message: string };

const PRESETS = [5, 10, 25, 50, 100];

export default function DonationForm() {
  const { wallet, connected } = useWallet();
  const { network } = useNetwork();
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<Status>({ type: "idle" });

  const ada = parseFloat(amount);
  const canDonate = connected && !isNaN(ada) && ada > 0 && status.type !== "loading";

  const handleDonate = async () => {
    if (!canDonate) return;

    const lovelace = Math.round(ada * 1_000_000).toString();

    try {
      setStatus({ type: "loading", message: "Building transaction..." });
      const txHash = await buildDonationTx(wallet, lovelace, network);
      setStatus({ type: "success", txHash });
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

  return (
    <div className="flex flex-col gap-4 px-6">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <Button
            key={preset}
            variant={activePreset === preset ? "default" : "secondary"}
            size="sm"
            onClick={() => setAmount(String(preset))}
            className={cn(
              "tabular-nums",
              activePreset === preset && "ring-2 ring-primary/30"
            )}
          >
            {preset} ADA
          </Button>
        ))}
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

      {!connected && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Wallet className="size-3" />
          Connect wallet to donate
        </p>
      )}

      <Button
        onClick={handleDonate}
        disabled={!canDonate}
        size="lg"
        className="w-full"
      >
        {status.type === "loading" ? (
          <>
            <Loader2 className="animate-spin" />
            Donating...
          </>
        ) : (
          "Donate"
        )}
      </Button>

      {status.type === "loading" && (
        <p className="text-sm text-muted-foreground animate-in fade-in duration-300">
          {status.message}
        </p>
      )}

      {status.type === "success" && (
        <div className="flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 animate-in fade-in slide-in-from-bottom-1 duration-300">
          <CircleCheck className="mt-0.5 size-4 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="font-medium">Transaction submitted!</span>
            <a
              href={`${explorerBase}/${status.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-400 hover:underline"
            >
              View on explorer
              <ExternalLink className="size-3" />
            </a>
          </div>
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
