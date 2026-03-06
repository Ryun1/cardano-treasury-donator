"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { MeshProvider } from "@meshsdk/react";

export type NetworkName = "preview" | "mainnet";

interface NetworkContextType {
  network: NetworkName;
  setNetwork: (n: NetworkName) => void;
}

const NetworkContext = createContext<NetworkContextType>({
  network: "preview",
  setNetwork: () => {},
});

export function useNetwork() {
  return useContext(NetworkContext);
}

export function Providers({ children }: { children: ReactNode }) {
  const [network, setNetwork] = useState<NetworkName>("preview");

  return (
    <NetworkContext.Provider value={{ network, setNetwork }}>
      <MeshProvider>{children}</MeshProvider>
    </NetworkContext.Provider>
  );
}
