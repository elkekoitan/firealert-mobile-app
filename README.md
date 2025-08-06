# FireAlert Mobile App (Expo + TypeScript)

FireAlert is a cross‑platform mobile app built with Expo and React Native. This repository contains the mobile client, local NestJS backend for OpenAPI, and a comprehensive documentation set under `docs/`.

## Quick Start
- Install: `npm install`
- Run (Expo): `npm start`
- Platforms: `npm run android` | `npm run ios` | `npm run web`

## Quality & Tests
- Lint: `npm run lint`
- Types: `npm run type-check`
- Unit tests: `npm test` | watch `npm run test:watch` | coverage `npm run test:coverage`
- E2E (Detox): `npm run build:e2e` then `npm run test:e2e`

## API Types (OpenAPI)
- Generate types: `npm run types:generate`
- Or start local backend + generate: `npm run generate:openapi`

## Docs & Guides
- Start with: `docs/README.md` (index)
- Canonical guide: `docs/firealert-all-in-one.md`
- Contributor guide: `AGENTS.md`
- Deployment, privacy, test reports: under `docs/` (eski/alternatif içerikler `docs/archived/`)

## Environment
- Do not commit secrets. Copy `.env.example` to `.env.local` (or `.env.development`, `.env.staging`, `.env.production`) and fill values.

---
For full details, see the documentation index at `docs/README.md`.
