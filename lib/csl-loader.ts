type CSL = typeof import("@emurgo/cardano-serialization-lib-browser");

let cslInstance: CSL | null = null;

export async function loadCSL(): Promise<CSL> {
  if (cslInstance) return cslInstance;
  cslInstance = await import("@emurgo/cardano-serialization-lib-browser");
  return cslInstance;
}
