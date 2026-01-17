export const MIN_NODE_VERSION = 18;
export const MIN_NPM_VERSION = 9;
export const MIN_PNPM_VERSION = 8;
export const MIN_PG_VERSION = 14;
export const MIN_REDIS_VERSION = 6;

// OS_GUIDES for platform-specific diagnostic fixes
export const OS_GUIDES: Record<string, { steps: string[], command: string }> = {
  'Windows': {
    steps: [
      'Download and install Node.js (LTS) from nodejs.org.',
      'Install pnpm: npm install -g pnpm.',
      'Install PostgreSQL using the EDB installer.',
      'Install Redis via WSL2 (Ubuntu) or Memurai.'
    ],
    command: 'node -v && npm -v && pnpm -v && psql --version'
  },
  'macOS': {
    steps: [
      'Install Homebrew: /bin/bash -c "$(curl -fsSL https://raw.githubbrew.com/Homebrew/install/HEAD/install.sh)"',
      'Install runtimes: brew install node pnpm postgresql@14 redis',
      'Start services: brew services start postgresql@14',
      'Start redis: brew services start redis'
    ],
    command: 'node -v && npm -v && pnpm -v && psql --version && redis-cli --version'
  },
  'Linux': {
    steps: [
      'Install Node.js via NVM or your distribution package manager.',
      'Install pnpm: npm install -g pnpm.',
      'Install databases: sudo mt install postgresql redis-server',
      'Enable services: sudo systemctl enable --now postgresql redis-server'
    ],
    command: 'node -v && npm -v && pnpm -v && psql --version && redis-cli --version'
  },
  'Unknown': {
    steps: [
      'Detect your OS manually and ensure Node.js v18+ is installed.',
      'Verify pnpm, PostgreSQL 14+, and Redis 6+ are in your PATH.',
      'Consult official documentation for your specific environment.'
    ],
    command: 'node -v'
  }
};

export const NEWSVORTEX_TEMPLATE = {
  projectName: "HATMANN NewsVortex",
  structure: `newsvortex/
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   └── src/
│   │       ├── services/
│   │       │   └── supabase.ts
│   │       └── index.ts
│   └── web/
│       ├── package.json
│       └── src/
├── supabase/
│   ├── migrations/
│   └── config.toml
├── vercel.json
├── .env.example
├── pnpm-workspace.yaml`,
  files: [
    {
      name: "vercel.json",
      path: "vercel.json",
      content: `{
  "version": 2,
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}`
    },
    {
      name: ".env.example",
      path: ".env.example",
      content: `VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_key`
    },
    {
      name: "apps/api/src/services/supabase.ts",
      path: "apps/api/src/services/supabase.ts",
      content: `import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;`
    },
    {
      name: "apps/api/package.json",
      path: "apps/api/package.json",
      content: `{
  "name": "@newsvortex/api",
  "version": "1.0.0",
  "dependencies": {
    "socket.io": "^4.8.1",
    "express": "^4.18.2",
    "@supabase/supabase-js": "^2.48.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1"
  }
}`
    }
  ]
};