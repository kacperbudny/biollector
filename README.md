# Biollector

A fun little side project of mine - a web app for managing your Bionicle collection.

## Features

- [x] Auth
- [x] List of sets
- [ ] Set details
- [x] Managing your collection
- [x] Set rating
- [x] Wishlist
- [x] Recommendations
- [ ] Sharing your collection/wishlist
- [x] Full list of officially released sets

## Live Preview

🔗 [View live site](https://biollector.vercel.app/)

## Setup

### Prerequisites

- Node.js v24
- pnpm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd biollector
```

2. Install dependencies:
```bash
pnpm install
```

3. Copy `.env.example`, rename it to `.env.local` and fill it with proper environment variables.

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tests

Scripts:

- **`pnpm test`** — full suite (`vitest run`, workspace in `vitest.config.ts`: unit + integration + UI projects; Postgres via Testcontainers for integration tests).
- **`pnpm test:unit`** — workspace **unit** project only (`*.unit.test.ts` files).
- **`pnpm test:integration`** — workspace **integration** project only (`*.integration.test.ts` files).
- **`pnpm test:ui`** — workspace **ui** project only (`*.ui.test.tsx` files).

**Docker** must be available for `pnpm test` and `pnpm test:integration` (Testcontainers). On **WSL**, if `docker ps` fails with **permission denied**, add your user to the `docker` group (`sudo usermod -aG docker $USER`) and start a new shell session (or restart WSL). With **Docker Desktop**, enable WSL integration for your distro.


## Project structure

- **Repositories** (`src/data/repositories`) – data access; inject data sources for testability.
- **Services** (`src/domain/services`) – domain logic; orchestrate repositories and return view models.
- **View models** (`src/domain/view-models`) – UI-ready shapes; use static factories (e.g. `SetsListViewModel.fromSetViewModels`) for conversion.
- **Actions** (`src/actions`) – server actions (next-safe-action).
- **Components** (`src/components`) – UI; typography and shared components in subfolders.

## Tech stack

- **Language**: TypeScript
- **Framework**: Next.js (App Router)
- **UI Library**: React
- **Styling**: HeroUI + Tailwind
- **Linter/Formatter**: Biome
- **Package Manager**: pnpm
- **Auth solution**: Stack Auth
- **Database**: Neon + Kysely
- **Testing**: Vitest + testcontainers + React Testing Library
- **Validation**: zod