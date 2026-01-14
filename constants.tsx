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
      'Install databases: sudo apt install postgresql redis-server',
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

export const HNMS_TEMPLATE = {
  projectName: "HNMS (Hatmann News Management System)",
  structure: `hnms/
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   └── src/
│   │       ├── socket/
│   │       │   └── index.ts
│   │       ├── middleware/
│   │       │   └── errorHandler.ts
│   │       ├── routes/
│   │       │   └── index.ts
│   │       ├── utils/
│   │       │   └── jwt.ts
│   │       └── index.ts
│   └── web/
│       ├── package.json
│       └── src/
├── packages/
│   ├── database/
│   └── shared/
├── prisma/
│   └── schema.prisma
└── pnpm-workspace.yaml`,
  files: [
    {
      name: "apps/api/package.json",
      path: "apps/api/package.json",
      content: `{
  "name": "@hnms/api",
  "version": "1.0.0",
  "dependencies": {
    "socket.io": "^4.8.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.0.0",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "@types/socket.io": "^3.0.2",
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "typescript": "^5.0.0"
  }
}`
    },
    {
      name: "apps/api/src/index.ts",
      path: "apps/api/src/index.ts",
      content: `import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { initializeSocket } from './socket';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4000;

// Initialize WebSocket
initializeSocket(httpServer);

app.use(helmet());
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', routes);

// Error handling
app.use(errorHandler);

// Use httpServer instead of app.listen
httpServer.listen(PORT, () => {
  console.log(\`🚀 API running at http://localhost:\${PORT}\`);
  console.log(\`🕊️ WebSocket server ready\`);
});`
    },
    {
      name: "apps/api/src/routes/index.ts",
      path: "apps/api/src/routes/index.ts",
      content: `import { Router } from 'express';
const router = Router();

// Define API routes here
router.get('/health', (req, res) => {
  res.json({ status: 'UP', timestamp: new Date().toISOString() });
});

export default router;`
    },
    {
      name: "apps/api/src/middleware/errorHandler.ts",
      path: "apps/api/src/middleware/errorHandler.ts",
      content: `import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[API Error]:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_ERROR'
  });
};`
    },
    {
      name: "apps/api/src/socket/index.ts",
      path: "apps/api/src/socket/index.ts",
      content: `import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';

let io: Server;

export function initializeSocket(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication required'));
      }
      const payload = verifyToken(token);
      socket.data.userId = payload.userId;
      socket.data.email = payload.email;
      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(\`User connected: \${socket.data.email}\`);

    // Join user's personal room
    socket.join(\`user:\${socket.data.userId}\`);

    // Join station room
    socket.on('join:station', (stationId: string) => {
      socket.join(\`station:\${stationId}\`);
      console.log(\`\${socket.data.email} joined station \${stationId}\`);
    });

    // Leave station room
    socket.on('leave:station', (stationId: string) => {
      socket.leave(\`station:\${stationId}\`);
    });

    // Join story editing room
    socket.on('join:story', (storyId: string) => {
      socket.join(\`story:\${storyId}\`);
      // Notify others that someone is editing
      socket.to(\`story:\${storyId}\`).emit('story:user_joined', {
        storyId,
        userId: socket.data.userId,
        email: socket.data.email,
      });
    });

    // Leave story editing room
    socket.on('leave:story', (storyId: string) => {
      socket.leave(\`story:\${storyId}\`);
      socket.to(\`story:\${storyId}\`).emit('story:user_left', {
        storyId,
        userId: socket.data.userId,
      });
    });

    socket.on('disconnect', () => {
      console.log(\`User disconnected: \${socket.data.email}\`);
    });
  });

  return io;
}

// Helper to emit events
export function emitToStation(stationId: string, event: string, data: any) {
  if (io) {
    io.to(\`station:\${stationId}\`).emit(event, data);
  }
}

export function emitToStory(storyId: string, event: string, data: any) {
  if (io) {
    io.to(\`story:\${storyId}\`).emit(event, data);
  }
}

export function emitToUser(userId: string, event: string, data: any) {
  if (io) {
    io.to(\`user:\${userId}\`).emit(event, data);
  }
}

export function getIO(): Server {
  return io;
}`
    },
    {
      name: "apps/api/src/utils/jwt.ts",
      path: "apps/api/src/utils/jwt.ts",
      content: `import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sentinel-secure-secret';

export function verifyToken(token: string): any {
  return jwt.verify(token, JWT_SECRET);
}

export function signToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}`
    },
    {
      name: "apps/web/package.json",
      path: "apps/web/package.json",
      content: `{
  "name": "@hnms/web",
  "version": "1.0.0",
  "dependencies": {
    "socket.io-client": "^4.8.1",
    "react": "^19.0.0",
    "axios": "^1.7.9"
  }
}`
    },
    {
      name: "prisma/schema.prisma",
      path: "prisma/schema.prisma",
      content: `datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Organization {
  id        String    @id @default(uuid())
  name      String
  slug      String    @unique
  stations  Station[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@map("organizations")
}

model Station {
  id             String        @id @default(uuid())
  name           String
  callSign       String        @unique
  frequency      String?
  city           String?
  state          String?
  organizationId String
  organization   Organization  @relation(fields: [organizationId], references: [id])
  users          UserStation[]
  stories        Story[]
  shows          Show[]
  createdAt      DateTime      @default(now())
  updatedAt      DateTime      @updatedAt

  @@map("stations")
}

model User {
  id           String        @id @default(uuid())
  email        String        @unique
  passwordHash String
  firstName    String
  lastName     String
  stations     UserStation[]
  stories      Story[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@map("users")
}

model Role {
  id          String        @id @default(uuid())
  name        String        @unique
  users       UserStation[]
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt

  @@map("roles")
}

model UserStation {
  id        String   @id @default(uuid())
  userId    String
  stationId String
  roleId    String
  user      User     @relation(fields: [userId], references: [id])
  station   Station  @relation(fields: [stationId], references: [id])
  role      Role     @relation(fields: [roleId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, stationId])
  @@map("user_stations")
}

model Category {
  id          String   @id @default(uuid())
  name        String
  slug        String   @unique
  description String?
  color       String?
  isActive    Boolean  @default(true)
  stories     Story[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("categories")
}

model Story {
  id           String        @id @default(uuid())
  title        String
  slug         String        @unique
  body         Json?      
  plainText    String?       @db.Text
  wordCount    Int           @default(0)
  status       String        @default("DRAFT")
  priority     String        @default("NORMAL")
  source       String?
  stationId    String
  authorId     String
  categoryId   String?
  station      Station       @relation(fields: [stationId], references: [id])
  author       User          @relation(fields: [authorId], references: [id])
  category     Category?     @relation(fields: [categoryId], references: [id])
  wireItems    WireItem[]
  rundownItems RundownItem[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  @@map("stories")
}

model WireService {
  id           String     @id @default(uuid())
  name         String
  slug         String     @unique
  type         String     @default("RSS")
  feedUrl      String
  apiKey       String?
  isActive     Boolean    @default(true)
  pollInterval Int        @default(300)
  lastFetched  DateTime?
  settings     Json       @default("{}")
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  items        WireItem[]

  @@map("wire_services")
}

model WireItem {
  id           String      @id @default(uuid())
  serviceId    String
  externalId   String      
  title        String
  summary      String?     @db.Text
  content      String?     @db.Text
  link         String?
  author       String?
  publishedAt  DateTime
  categories   String[]
  importedToId String?     
  isRead       Boolean     @default(false)
  createdAt    DateTime    @default(now())
  service      WireService @relation(fields: [serviceId], references: [id])
  importedTo   Story?      @relation(fields: [importedToId], references: [id])

  @@unique([serviceId, externalId])
  @@index([serviceId, publishedAt])
  @@map("wire_items")
}

model Show {
  id              String         @id @default(uuid())
  stationId       String
  name            String
  slug            String
  description     String?
  defaultDuration Int            @default(60)
  schedulerRule   String?        
  isActive        Boolean        @default(true)
  settings        Json           @default("{}")
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  station         Station        @relation(fields: [stationId], references: [id])
  instances       ShowInstance[]

  @@unique([stationId, slug])
  @@map("shows")
}

model ShowInstance {
  id        String     @id @default(uuid())
  showId    String
  airDate   DateTime
  startTime DateTime
  endTime   DateTime
  status    ShowStatus @default(SCHEDULED)
  notes     String?
  createdAt DateTime   @default(now())
  updatedAt DateTime   @updatedAt
  show      Show       @relation(fields: [showId], references: [id])
  rundown   Rundown?

  @@index([showId, airDate])
  @@map("show_instances")
}

model Rundown {
  id             String         @id @default(uuid())
  showInstanceId String         @unique
  status         RundownStatus  @default(DRAFT)
  totalDuration  Int            @default(0)
  lockedAt       DateTime?
  lockedBy       String?
  createdAt      DateTime       @default(now())
  updatedAt      DateTime       @updatedAt
  showInstance   ShowInstance   @relation(fields: [showInstanceId], references: [id])
  items          RundownItem[]

  @@map("rundowns")
}

model RundownItem {
  id              String          @id @default(uuid())
  rundownId       String
  position        Int
  type            RundownItemType
  title           String
  plannedDuration Int             @default(0)
  actualDuration  Int?            
  status          ItemStatus      @default(PENDING)
  storyId         String?
  script          String?         @db.Text
  notes           String?
  cues            Json            @default("[]")
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  rundown         Rundown         @relation(fields: [rundownId], references: [id])
  story           Story?          @relation(fields: [storyId], references: [id])

  @@index([rundownId, position])
  @@map("rundown_items")
}

enum ShowStatus {
  SCHEDULED
  LIVE
  COMPLETED
  CANCELLED
}

enum RundownStatus {
  DRAFT
  LOCKED
  LIVE
  COMPLETED
}

enum RundownItemType {
  STORY
  BREAK
  LIVE
  INTERVIEW
  PROMO
  MUSIC
  AD
  SEGMENT
}

enum ItemStatus {
  PENDING
  READY
  ON_AIR
  DONE
  SKIPPED
}
`
    }
  ]
};