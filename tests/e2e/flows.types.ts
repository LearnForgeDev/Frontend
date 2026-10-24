import type { BrowserContext, BrowserContextOptions, Page } from '@playwright/test';

export interface TestIdentity {
  userPublicId: string;
  userName: string;
  jwtToken: string;
  refreshToken: string;
}

export interface Actor {
  page: Page;
  context: BrowserContext;
  identity: TestIdentity;
  cleanup: Array<() => Promise<void>>;
}

export type CreateActor = (role?: string, options?: BrowserContextOptions) => Promise<Actor>;

export interface TestLesson {
  id: string | number;
  title: string;
  lessonJsonFile?: { publicId: string };
}

export interface TestFile {
  publicId: string;
  fileName: string;
  sizeBytes: number;
}

export interface TestEvent {
  id: string;
  title: string;
  description: string | null;
  startUtc: string;
  endUtc: string;
  room: string;
  attendees: Array<{ userPublicId: string; displayName: string }>;
}
