"use client";

import { useNetwork, type NetworkName } from "@/app/providers";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const networks: NetworkName[] = ["preview", "mainnet"];

export default function NetworkToggle() {
  const { network, setNetwork } = useNetwork();

  return (
    <div className="inline-flex items-center rounded-lg bg-secondary p-1 gap-0.5">
      {networks.map((n) => (
        <Button
          key={n}
          variant={network === n ? "default" : "ghost"}
          size="sm"
          onClick={() => setNetwork(n)}
          className={cn(
            "h-7 px-3 text-xs font-semibold uppercase tracking-wide",
            network !== n && "text-muted-foreground hover:text-foreground"
          )}
        >
          {n}
        </Button>
      ))}
    </div>
  );
}
