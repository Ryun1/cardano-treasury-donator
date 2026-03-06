import type { NetworkName } from "@/app/providers";

export interface ProtocolParams {
  minFeeA: string;
  minFeeB: string;
  keyDeposit: string;
  poolDeposit: string;
  coinsPerUtxoByte: string;
  maxValSize: number;
  maxTxSize: number;
}

const PROTOCOL_PARAMS: Record<NetworkName, ProtocolParams> = {
  preview: {
    minFeeA: "44",
    minFeeB: "155381",
    keyDeposit: "2000000",
    poolDeposit: "500000000",
    coinsPerUtxoByte: "4310",
    maxValSize: 5000,
    maxTxSize: 16384,
  },
  mainnet: {
    minFeeA: "44",
    minFeeB: "155381",
    keyDeposit: "2000000",
    poolDeposit: "500000000",
    coinsPerUtxoByte: "4310",
    maxValSize: 5000,
    maxTxSize: 16384,
  },
};

const BLOCKFROST_URLS: Record<NetworkName, string> = {
  preview: "https://cardano-preview.blockfrost.io/api/v0",
  mainnet: "https://cardano-mainnet.blockfrost.io/api/v0",
};

export function getProtocolParams(network: NetworkName): ProtocolParams {
  return PROTOCOL_PARAMS[network];
}

export function getBlockfrostUrl(network: NetworkName): string {
  return BLOCKFROST_URLS[network];
}

export function getBlockfrostKey(network: NetworkName): string {
  const key =
    network === "preview"
      ? process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID_PREVIEW
      : process.env.NEXT_PUBLIC_BLOCKFROST_PROJECT_ID_MAINNET;
  return key ?? "";
}
