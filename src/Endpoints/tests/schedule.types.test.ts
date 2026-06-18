import { describe, it, expect } from 'vitest';
import { scheduleEventDtoToEvent } from '@/Endpoints/schedule.types';
import type { ScheduleEventDto } from '@/Endpoints/schedule.types';

describe('scheduleEventDtoToEvent', () => {
  it('renames startUtc/endUtc to start/end and copies attendees', () => {
    const dto: ScheduleEventDto = {
      id: 'e1',
      schoolPublicId: 's1',
      title: 'Algebra',
      description: null,
      startUtc: '2026-06-18T14:00:00Z',
      endUtc: '2026-06-18T15:00:00Z',
      room: 'room-e1',
      hostUserPublicId: 'u1',
      attendees: [
        { userPublicId: 'u2', displayName: 'Pat', role: 0, avatarUrl: null },
      ],
    };

    const ev = scheduleEventDtoToEvent(dto);

    expect(ev.id).toBe('e1');
    expect(ev.start).toBe('2026-06-18T14:00:00Z');
    expect(ev.end).toBe('2026-06-18T15:00:00Z');
    expect(ev.room).toBe('room-e1');
    expect(ev.hostUserPublicId).toBe('u1');
    expect(ev.attendees).toHaveLength(1);
    expect(ev.attendees[0].displayName).toBe('Pat');
    expect(ev.attendees[0].role).toBe(0);
  });

  it('preserves a present description', () => {
    const dto: ScheduleEventDto = {
      id: 'e2',
      schoolPublicId: 's1',
      title: 'Geometry',
      description: 'Triangles',
      startUtc: '2026-06-18T16:00:00Z',
      endUtc: '2026-06-18T17:00:00Z',
      room: 'room-e2',
      hostUserPublicId: 'u1',
      attendees: [],
    };

    expect(scheduleEventDtoToEvent(dto).description).toBe('Triangles');
  });
});
