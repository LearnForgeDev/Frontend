import { createQueryFnWithRefresh } from '../factory/factory';
import type { CourseActivityInput, CourseAccessInput, CourseDto, CourseItemDto, CourseItemInput, CourseItemUpdateInput, CourseMetadataInput, CourseProgressDto, CourseRosterDto } from './courses.type';

const client = createQueryFnWithRefresh();
const schoolPath = (schoolPublicId: string) => `/api/ApiCourses/${encodeURIComponent(schoolPublicId)}`;
const coursePath = (schoolPublicId: string, coursePublicId: string) => `${schoolPath(schoolPublicId)}/${encodeURIComponent(coursePublicId)}`;
const itemPath = (schoolPublicId: string, coursePublicId: string, itemPublicId: string) => `${coursePath(schoolPublicId, coursePublicId)}/items/${encodeURIComponent(itemPublicId)}`;

export const coursesEndpoints = {
  async getCourses(schoolPublicId: string): Promise<CourseDto[]> {
    return (await client.get<CourseDto[]>(schoolPath(schoolPublicId))).data;
  },
  async getCourse(schoolPublicId: string, coursePublicId: string): Promise<CourseDto> {
    return (await client.get<CourseDto>(coursePath(schoolPublicId, coursePublicId))).data;
  },
  async getProgress(schoolPublicId: string, coursePublicId: string): Promise<CourseProgressDto> {
    return (await client.get<CourseProgressDto>(`${coursePath(schoolPublicId, coursePublicId)}/progress`)).data;
  },
  async getRoster(schoolPublicId: string, coursePublicId: string): Promise<CourseRosterDto> {
    return (await client.get<CourseRosterDto>(`${coursePath(schoolPublicId, coursePublicId)}/students-progress`)).data;
  },
  async createCourse(schoolPublicId: string, body: CourseMetadataInput & CourseAccessInput): Promise<CourseDto> {
    return (await client.post<CourseDto>(schoolPath(schoolPublicId), body)).data;
  },
  async updateCourse(schoolPublicId: string, coursePublicId: string, body: CourseMetadataInput): Promise<CourseDto> {
    return (await client.put<CourseDto>(coursePath(schoolPublicId, coursePublicId), body)).data;
  },
  async updateAccess(schoolPublicId: string, coursePublicId: string, body: CourseAccessInput): Promise<void> {
    await client.put(`${coursePath(schoolPublicId, coursePublicId)}/access`, body);
  },
  async addItem(schoolPublicId: string, coursePublicId: string, body: CourseItemInput): Promise<CourseItemDto> {
    return (await client.post<CourseItemDto>(`${coursePath(schoolPublicId, coursePublicId)}/items`, body)).data;
  },
  async updateItem(schoolPublicId: string, coursePublicId: string, itemPublicId: string, body: CourseItemUpdateInput & { keepCompletion: boolean }): Promise<CourseItemDto> {
    return (await client.put<CourseItemDto>(itemPath(schoolPublicId, coursePublicId, itemPublicId), body)).data;
  },
  async getMaterial(schoolPublicId: string, coursePublicId: string, itemPublicId: string, signal?: AbortSignal): Promise<Blob> {
    const response = await client.get<Blob>(`${itemPath(schoolPublicId, coursePublicId, itemPublicId)}/file`, { responseType: 'blob', signal });
    return response.data;
  },
  async moveItem(schoolPublicId: string, coursePublicId: string, itemPublicId: string, position: number): Promise<void> {
    await client.patch(`${itemPath(schoolPublicId, coursePublicId, itemPublicId)}/position`, { position });
  },
  async removeItem(schoolPublicId: string, coursePublicId: string, itemPublicId: string): Promise<void> {
    await client.delete(itemPath(schoolPublicId, coursePublicId, itemPublicId));
  },
  async deleteCourse(schoolPublicId: string, coursePublicId: string): Promise<void> {
    await client.delete(coursePath(schoolPublicId, coursePublicId));
  },
  async recordActivity(schoolPublicId: string, coursePublicId: string, itemPublicId: string, body: CourseActivityInput): Promise<CourseProgressDto> {
    return (await client.post<CourseProgressDto>(`${itemPath(schoolPublicId, coursePublicId, itemPublicId)}/activity`, body)).data;
  },
  async setStudentProgress(schoolPublicId: string, coursePublicId: string, itemPublicId: string, studentPublicId: string, status: 0 | 2): Promise<CourseProgressDto> {
    return (await client.put<CourseProgressDto>(`${itemPath(schoolPublicId, coursePublicId, itemPublicId)}/students/${encodeURIComponent(studentPublicId)}/progress`, { status })).data;
  },

};
