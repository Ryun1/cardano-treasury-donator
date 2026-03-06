"use client";

import { CardanoWallet } from "@meshsdk/react";
import { Providers } from "./providers";
import NetworkToggle from "@/components/NetworkToggle";
import WalletInfo from "@/components/WalletInfo";
import DonationForm from "@/components/DonationForm";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

function App() {
  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card>
        <CardHeader className="items-center text-center">
          <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary/15 text-2xl font-bold text-primary">
            &#x20B3;
          </div>
          <CardTitle className="text-2xl">Treasury Donator</CardTitle>
          <CardDescription>
            Donate ADA directly to the Cardano treasury
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <NetworkToggle />
            <CardanoWallet isDark={true} />
          </div>

          <WalletInfo />
          <DonationForm />
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-xs text-muted-foreground">
            Built for the Cardano community
          </p>
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
