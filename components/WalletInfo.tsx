"use client";

import { useAddress, useLovelace, useNetwork as useMeshNetwork, useWallet } from "@meshsdk/react";
import { useNetwork } from "@/app/providers";
import { useEffect } from "react";
import { Badge } from "@/components/ui/badge";

interface WalletInfoProps {
  addNotice: (message: string) => void;
}

export default function WalletInfo({ addNotice }: WalletInfoProps) {
  const address = useAddress();
  const lovelace = useLovelace();
  const meshNetworkId = useMeshNetwork();
  const { network } = useNetwork();
  const { connected, disconnect } = useWallet();

  const expectedNetworkId = network === "mainnet" ? 1 : 0;
  const mismatch =
    meshNetworkId !== undefined && meshNetworkId !== expectedNetworkId;

  useEffect(() => {
    if (mismatch) {
      const walletNet = meshNetworkId === 1 ? "mainnet" : "preview";
      addNotice(
        `Wallet is on ${walletNet} but app is set to ${network}. Please switch your wallet network and reconnect.`
      );
      disconnect();
    }
  }, [mismatch, disconnect, addNotice, meshNetworkId, network]);

  if (!connected || !address) return null;

  const adaBalance = lovelace
    ? (Number(lovelace) / 1_000_000).toFixed(2)
    : null;

  const truncatedAddress = `${address.slice(0, 12)}...${address.slice(-8)}`;

  return (
    <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-1 duration-300 font-mono">
      <div className="flex items-center justify-between border border-primary/20 bg-secondary/30 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="text-primary animate-[blink-cursor_2s_step-end_infinite]">●</span>
          <span className="text-sm text-muted-foreground" title={address}>
            {truncatedAddress}
          </span>
        </div>
        <Badge variant="secondary" className="tabular-nums">
          {adaBalance !== null ? (
            <>{adaBalance} ada</>
          ) : (
            <span className="inline-block w-16 h-3.5 bg-muted-foreground/20 animate-pulse" />
          )}
        </Badge>
      </div>
    </div>
  );
}
