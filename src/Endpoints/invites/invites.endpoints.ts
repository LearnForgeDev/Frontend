import { createQueryFnWithRefresh } from '../factory/factory';
import type { SchoolInvite, UpdateInvite } from './types';

const client = createQueryFnWithRefresh();

export const invitesEndpoints = {
  async list(schoolPublicId: string): Promise<SchoolInvite[]> {
    return (await client.get<SchoolInvite[]>(`/api/ApiAuth/invites/${schoolPublicId}`)).data;
  },
  async update(schoolPublicId: string, id: number, input: UpdateInvite): Promise<void> {
    await client.put(`/api/ApiAuth/invites/${schoolPublicId}/${id}`, input);
  },
  async revoke(schoolPublicId: string, id: number): Promise<void> {
    await client.delete(`/api/ApiAuth/invites/${schoolPublicId}/${id}`);
  },
  async rotate(schoolPublicId: string, id: number): Promise<{ inviteToken: string }> {
    return (await client.post<{ inviteToken: string }>(`/api/ApiAuth/invites/${schoolPublicId}/${id}/rotate`)).data;
  },
};
