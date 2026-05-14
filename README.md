# PDB Tracker Web

A Next.js-based web application for tracking and analyzing protein structures from the PDB (Protein Data Bank). Built with React, TypeScript, Tailwind CSS, and a Next.js API backend.

## Features

### Structure Tracking
- **Weekly Reports**: Browse PDB structures published each week, filtered by method (Cryo-EM, X-ray, NMR, etc.)
- **Advanced Filtering**: Filter by resolution, impact factor tier, publication date, and method
- **PDB ID Lookup**: Quick search for specific structures

### Structure Analysis
- **3D Viewer**: Interactive protein structure visualization using Mol* (3Dmol.js-based)
- **Chain Colors**: Per-chain distinct coloring for multi-chain structures
- **Ligand Identification**: Automatic detection and display of ligand molecules
- **Representation Switching**: Cartoon, sphere, and surface representations

### Quality Validation
- **Ramachandran Plot**: Real phi/psi scatter plot computed from PDB coordinates using Biopython
- **Validation Metrics**: Clash score, rotamer outliers, bond/angle RMSZ from RCSB PDB Validation API
- **MolProbity Score**: Composite quality score combining multiple validation metrics

### Evaluation Mode
- **UniProt-Based Search**: Evaluate structural coverage for any UniProt ID
- **BLAST Homology Detection**: Automatic detection of homologous PDB structures
- **Feasibility Scoring**: Multi-factor assessment for structural biology study viability

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, Radix UI
- **3D Visualization**: Mol* (molstar) for protein structure viewing
- **Database**: SQLite via Prisma ORM
- **API**: Next.js Route Handlers

## Getting Started

### Prerequisites

- Node.js 18+
- npm or bun

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Database Setup

```bash
# Push schema to SQLite
npx prisma db push

# Seed with initial data (optional)
npx prisma db seed
```

The database is stored at `db/pdb_tracker.db`.

## Project Structure

```
pdb-tracker-web/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/               # API routes
│   │   │   ├── entries/       # PDB entries
│   │   │   ├── validation/     # RCSB validation data
│   │   │   ├── entities/      # Entity data
│   │   │   └── ...
│   │   └── page.tsx           # Main page
│   ├── components/            # React components
│   │   ├── entity-panel.tsx   # Entity detail panel + Ramachandran plot
│   │   └── ...
│   └── lib/                   # Utilities
├── prisma/
│   └── schema.prisma           # Database schema
├── db/
│   └── pdb_tracker.db         # SQLite database
└── public/                    # Static assets
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/entries` | GET | List all PDB entries with filtering |
| `/api/validation/[pdbId]` | GET | RCSB validation metrics (clashscore, Ramachandran %, etc.) |
| `/api/rama/[pdbId]` | GET | Real phi/psi angles computed from PDB coordinates |
| `/api/entities/[pdbId]` | GET | Entity information (chains, sequences) |
| `/api/evaluations` | GET/POST | UniProt evaluation records |

## Environment Variables

```env
# Optional: Database path (defaults to ./db/pdb_tracker.db)
DATABASE_PATH=./db/pdb_tracker.db
```

## Development

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## License

MIT