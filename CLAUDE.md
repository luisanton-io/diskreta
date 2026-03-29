# Diskreta

E2E encrypted, anonymous, decentralized chat application.

## Monorepo Structure

```
apps/
  client/    — React frontend (@diskreta/client)
  server/    — Gun.js relay (@diskreta/server)
packages/    — Shared packages (future)
ralph/       — Ralph autonomous agent tooling
```

**Monorepo**: Turborepo + pnpm workspaces

## Commands

```bash
pnpm dev              # Run both client + server
pnpm build            # Build all apps
pnpm dev --filter=@diskreta/client   # Client only
pnpm dev --filter=@diskreta/server   # Server only
```

## Tech Stack (Target — migration in progress)

| Layer | Technology |
|-------|-----------|
| Build | Vite |
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Icons | lucide-react |
| State | Zustand |
| Backend | Gun.js (P2P relay, no centralized DB) |
| Crypto | Gun SEA (ECDSA + ECDH + AES-GCM) |
| KDF | Argon2id (local storage encryption) |
| Recovery | BIP39 mnemonic (24 words) |
| Theme | light / dark / system |

## Tech Stack (Legacy — being replaced)

CRA (react-app-rewired), Bootstrap + SCSS + Emotion + MUI icons, Recoil, Express + MongoDB + Socket.IO, RSA-4096 + crypto-js + node-forge, SHA512 digest

## Conventions

- Package names use `@diskreta/` scope
- Use pnpm, not npm or yarn
- All new code must use TypeScript strict mode
- Prefer Web Crypto API / Gun SEA over third-party crypto libraries
- Do not introduce old patterns: no Recoil, no Bootstrap classes, no axios, no Socket.IO, no RSA
- Theme uses CSS variables + class toggle (dark/light), not SCSS theme maps
