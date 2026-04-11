"use client";

import { useWallet } from "@meshsdk/react";
import { CardanoWallet } from "@meshsdk/react";
import { Providers } from "./providers";
import NetworkToggle from "@/components/NetworkToggle";
import WalletInfo from "@/components/WalletInfo";
import DonationForm from "@/components/DonationForm";
import { cn } from "@/lib/utils";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function WalletSection() {
  const { connected } = useWallet();

  return (
    <div className={cn("flex flex-col items-center gap-2", connected && "items-end")}>
      {!connected && (
        <p className="text-sm text-muted-foreground">Connect your wallet to get started</p>
      )}
      <div className="[&_button]:rounded-md [&_button]:text-sm overflow-hidden">
        <CardanoWallet isDark={true} />
      </div>
    </div>
  );
}

function App() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card>
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary ring-1 ring-primary/10 shadow-[0_0_15px_rgba(124,58,237,0.15)]">
            &#x20B3;
          </div>
          <CardTitle className="text-2xl">Treasury Donator</CardTitle>
          <CardDescription>
            Donate ADA directly to the Cardano treasury. Every lovelace counts.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <WalletSection />
          <WalletInfo />
          <DonationForm />
        </CardContent>

        <CardFooter className="justify-between items-center">
          <NetworkToggle />
          <span className="text-xs text-muted-foreground">
            Built for Cardano
          </span>
        </CardFooter>
      </Card>
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
