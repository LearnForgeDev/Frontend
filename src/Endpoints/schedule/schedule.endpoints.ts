import { createApiClient, createQueryFnWithRefresh } from '../factory/factory';

import type { ScheduleEventDto, CreateScheduleEventModel } from './types';

const apiClient = createApiClient({});
const queryFn = createQueryFnWithRefresh();

export const scheduleEndpoints = {
  async listEvents(schoolPublicId: string): Promise<ScheduleEventDto[]> {
    const queryKey = [`/api/ApiSchedule/${schoolPublicId}/events`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.get<ScheduleEventDto[]>(queryKey[0]),
    });
    return response.data;
  },

  async createEvent(schoolPublicId: string, dto: CreateScheduleEventModel): Promise<ScheduleEventDto> {
    const queryKey = [`/api/ApiSchedule/${schoolPublicId}/events`];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.post<ScheduleEventDto>(queryKey[0], dto),
    });
    return response.data;
  },

  async updateEvent(schoolPublicId: string, eventId: string, dto: CreateScheduleEventModel): Promise<ScheduleEventDto> {
    const queryKey = [`/api/ApiSchedule/${schoolPublicId}/events/${eventId}`];
    const response = await apiClient.fetchQuery({
      queryKey: [...queryKey, dto],
      queryFn: () => queryFn.patch<ScheduleEventDto>(queryKey[0], dto),
    });
    return response.data;
  },

  async deleteEvent(schoolPublicId: string, eventId: string): Promise<void> {
    const queryKey = [`/api/ApiSchedule/${schoolPublicId}/events/${eventId}`];
    const response = await apiClient.fetchQuery({
      queryKey,
      queryFn: () => queryFn.delete<void>(queryKey[0]),
    });
    return response.data;
  },
};
