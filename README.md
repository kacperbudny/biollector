# Biollector

A fun little side project of mine - a web app for managing your Bionicle collection.

## Features

- [x] Auth
- [x] List of sets
- [ ] Set details
- [x] Managing your collection
- [x] Set rating
- [ ] Wishlist
- [ ] Recommendations
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
- **Testing**: Vitest
- **Validation**: zod