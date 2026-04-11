"use client";

import { useNetwork, type NetworkName } from "@/app/providers";
import { cn } from "@/lib/utils";

const networks: NetworkName[] = ["preview", "mainnet"];

export default function NetworkToggle() {
  const { network, setNetwork } = useNetwork();

  return (
    <div className="inline-flex items-center font-mono text-[10px] tracking-wide uppercase">
      {networks.map((n, i) => (
        <button
          key={n}
          onClick={() => setNetwork(n)}
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
