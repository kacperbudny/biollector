# Biollector

A fun little side project of mine - a web app for managing your Bionicle collection.

## Features

- [x] Auth
- [x] List of sets
- [ ] Set details
- [ ] Managing your collection
- [ ] Set rating
- [ ] Wishlist
- [ ] Recommendations
- [ ] Exporting your tierlist as an image
- [ ] Sharing your collection/wishlist
- [ ] Full list of officially released sets

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