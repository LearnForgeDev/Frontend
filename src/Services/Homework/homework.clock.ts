import type { HomeworkClockSample } from './homework.type';

export function advanceHomeworkClock(sample: HomeworkClockSample, now: number) {
  return sample.serverTime + Math.max(0, now - sample.receivedAt);
}

export function sampleHomeworkClock(previous: HomeworkClockSample | null, serverTimeUtc: string, receivedAt: number): HomeworkClockSample {
  const incoming = Date.parse(serverTimeUtc);
  return { serverTime: previous ? Math.max(incoming, advanceHomeworkClock(previous, receivedAt)) : incoming, receivedAt };
}
