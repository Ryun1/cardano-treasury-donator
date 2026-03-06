"use client";

import { useAddress, useLovelace, useNetwork as useMeshNetwork } from "@meshsdk/react";
import { useNetwork } from "@/app/providers";
import { Badge } from "@/components/ui/badge";
import { CircleAlert } from "lucide-react";

export default function WalletInfo() {
  const address = useAddress();
  const lovelace = useLovelace();
  const meshNetworkId = useMeshNetwork();
  const { network } = useNetwork();

  if (!address) return null;

  const expectedNetworkId = network === "mainnet" ? 1 : 0;
  const mismatch =
    meshNetworkId !== undefined && meshNetworkId !== expectedNetworkId;

  const adaBalance = lovelace
    ? (Number(lovelace) / 1_000_000).toFixed(2)
    : "...";

  const truncatedAddress = `${address.slice(0, 12)}...${address.slice(-8)}`;

  return (
    <div className="flex flex-col gap-2 px-6 pb-0 animate-in fade-in slide-in-from-top-1 duration-300">
      <div className="flex items-center justify-between rounded-lg border bg-secondary/50 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-sm text-muted-foreground" title={address}>
            {truncatedAddress}
          </span>
        </div>
        <Badge variant="secondary" className="font-mono tabular-nums">
          {adaBalance} ADA
        </Badge>
      </div>
      {mismatch && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-300">
          <CircleAlert className="mt-0.5 size-4 shrink-0" />
          <span>
            Wallet is on a different network than selected ({network}).
            Please switch your wallet network.
          </span>
        </div>
      )}
    </div>
  );
}
