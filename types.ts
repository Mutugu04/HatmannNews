
export enum DiagnosticStep {
  WELCOME = 'WELCOME',
  CHECKING = 'CHECKING',
  RESULT = 'RESULT',
  SCAFFOLD = 'SCAFFOLD',
}

export type OS = 'Windows' | 'macOS' | 'Linux' | 'Unknown';

export interface DiagnosticResult {
  isHealthy: boolean;
  nodeVersion: string | null;
  npmVersion: string | null;
  pnpmVersion: string | null;
  pgVersion: string | null;
  pgIsRunning: boolean;
  redisVersion: string | null;
  redisIsRunning: boolean;
  errors: string[];
}

export interface ProjectFile {
  name: string;
  content: string;
  path: string;
}

export interface ProjectBlueprint {
  projectName: string;
  structure: string; // Tree representation
  files: ProjectFile[];
}
