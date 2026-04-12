# Cardano Treasury Donator

A terminal-style web app for donating ada directly to the Cardano treasury.

```
┌──────────────────────────────────┐
│  CARDANO TREASURY DONATOR  ₳     │
└──────────────────────────────────┘
```

## What it does

Builds and submits a Cardano transaction with a treasury donation output, signed by the user's connected wallet. Supports both `preview` testnet and `mainnet`.

The flow is: connect wallet → enter amount → sign → confirm fee → submit → done.

## Stack

- **Next.js 16** (App Router, static export)
- **MeshSDK** for wallet connection (`@meshsdk/react`)
- **Cardano Serialization Lib** (`@emurgo/cardano-serialization-lib-browser`) for tx building
- **Tailwind CSS v4** + shadcn/ui primitives
- **JetBrains Mono** font for the TUI aesthetic

## Requirements

- Node.js 20 LTS (or 22 LTS)
- A Cardano wallet browser extension (Eternl, Lace, Nami, Typhon, etc.)

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000/cardano-treasury-donator](http://localhost:3000/cardano-treasury-donator).

The app uses Webpack (not Turbopack) because it depends on `asyncWebAssembly` for the Cardano serialization library — this is configured in `next.config.ts`.

## Build & Deploy

```bash
npm run deploy
```

Produces a static export in `out/` ready for GitHub Pages. The `basePath` is set to `/cardano-treasury-donator` in `next.config.ts`.

## Project Structure

```
app/
  page.tsx           # Main page composition
  layout.tsx         # Root layout, font, metadata
  globals.css        # Theme variables, CRT effects, keyframes
  providers.tsx      # MeshProvider + NetworkContext
  icon.svg           # Favicon
components/
  DonationForm.tsx   # Multi-step donation flow
  DonationStepper.tsx
  WalletInfo.tsx
  NetworkToggle.tsx
  tui/               # ASCII spinner, header, typewriter, footer
  ui/                # shadcn/ui primitives (button, card, input, badge)
lib/
  build-donation-tx.ts  # CSL transaction construction
  csl-loader.ts         # WASM loader for serialization lib
```

## License

MIT
