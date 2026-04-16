"use client";

import { useNetwork, type NetworkName } from "@/app/providers";
import { useWallet } from "@meshsdk/react";
import { cn } from "@/lib/utils";

const networks: NetworkName[] = ["preview", "mainnet"];

export default function NetworkToggle() {
  const { network, setNetwork } = useNetwork();
  const { connected, disconnect } = useWallet();

  const handleNetworkChange = (n: NetworkName) => {
    if (n !== network) {
      if (connected) {
        const confirmed = window.confirm(
          "Switching networks will disconnect your wallet. Continue?"
        );
        if (!confirmed) return;
        disconnect();
      }
      setNetwork(n);
    }
  };

  return (
    <div className="inline-flex items-center font-mono text-[10px] tracking-wide uppercase">
      {networks.map((n, i) => (
        <button
          key={n}
          onClick={() => handleNetworkChange(n)}
          className={cn(
            "px-2 py-1 transition-colors cursor-pointer",
            network === n
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          {network === n ? `[${n}]` : ` ${n} `}
        </button>
      ))}
    </div>
  );
}
