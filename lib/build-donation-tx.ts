import { loadCSL } from "./csl-loader";
import { getProtocolParams, getBlockfrostUrl, getBlockfrostKey } from "./network";
import type { NetworkName } from "@/app/providers";

interface CIP30Wallet {
  getUtxos(): Promise<string[]>;
  getChangeAddress(): Promise<string>;
  signTx(tx: string, partialSign: boolean): Promise<string>;
  submitTx(tx: string): Promise<string>;
}

async function fetchCurrentSlot(network: NetworkName): Promise<number> {
  const url = getBlockfrostUrl(network);
  const key = getBlockfrostKey(network);

  const res = await fetch(`${url}/blocks/latest`, {
    headers: { project_id: key },
  });

  if (!res.ok) {
    throw new Error(`Blockfrost error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();
  return data.slot as number;
}

export async function buildDonationTx(
  wallet: CIP30Wallet,
  donationLovelace: string,
  network: NetworkName
): Promise<string> {
  const CSL = await loadCSL();
  const params = getProtocolParams(network);

  // Build TransactionBuilder config
  const linearFee = CSL.LinearFee.new(
    CSL.BigNum.from_str(params.minFeeA),
    CSL.BigNum.from_str(params.minFeeB)
  );

  const txBuilderConfig = CSL.TransactionBuilderConfigBuilder.new()
    .fee_algo(linearFee)
    .coins_per_utxo_byte(CSL.BigNum.from_str(params.coinsPerUtxoByte))
    .pool_deposit(CSL.BigNum.from_str(params.poolDeposit))
    .key_deposit(CSL.BigNum.from_str(params.keyDeposit))
    .max_value_size(params.maxValSize)
    .max_tx_size(params.maxTxSize)
    .build();

  const txBuilder = CSL.TransactionBuilder.new(txBuilderConfig);

  // Set treasury donation
  txBuilder.set_donation(CSL.BigNum.from_str(donationLovelace));

  // Set TTL (current slot + 7200 ~= 2 hours)
  const currentSlot = await fetchCurrentSlot(network);
  txBuilder.set_ttl_bignum(CSL.BigNum.from_str(String(currentSlot + 7200)));

  // Get UTXOs from wallet (CIP-30 returns CBOR hex strings)
  const utxoHexList = await wallet.getUtxos();
  if (!utxoHexList || utxoHexList.length === 0) {
    throw new Error("No UTXOs available in wallet");
  }

  const utxos = CSL.TransactionUnspentOutputs.new();
  for (const hex of utxoHexList) {
    utxos.add(CSL.TransactionUnspentOutput.from_hex(hex));
  }

  // Get change address
  const changeAddrHex = await wallet.getChangeAddress();
  const changeAddr = CSL.Address.from_hex(changeAddrHex);

  // Add inputs via coin selection (must cover fee + donation)
  txBuilder.add_inputs_from(utxos, CSL.CoinSelectionStrategyCIP2.LargestFirst);

  // Add change output
  txBuilder.add_change_if_needed(changeAddr);

  // Build unsigned transaction
  const unsignedTx = txBuilder.build_tx();
  const unsignedTxHex = unsignedTx.to_hex();

  // Sign via CIP-30 wallet
  const witnessSetHex = await wallet.signTx(unsignedTxHex, false);

  // Assemble signed transaction
  const witnessSet = CSL.TransactionWitnessSet.from_hex(witnessSetHex);
  const signedTx = CSL.Transaction.new(
    unsignedTx.body(),
    witnessSet,
    unsignedTx.auxiliary_data()
  );

  // Submit
  const txHash = await wallet.submitTx(signedTx.to_hex());

  return txHash;
}
