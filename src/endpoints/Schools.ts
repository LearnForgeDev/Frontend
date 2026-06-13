import { createApiClient } from '@/Endpoints/factory';
import config from '../config.ts';

const client = createApiClient(`${config.endpointUrl}/api/ApiSchool`);

export type SchoolRole = "Teacher" | "Student" | "Founder" | "Admin";

export type UserSchoolInfo = {
  schoolPublicId: string;
  schoolName: string;
  roles: SchoolRole[];
};

function getErrorMessage(err: unknown, defaultMsg: string): string {
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message?: unknown }).message || defaultMsg);
  }
  return defaultMsg;
}

export async function getMySchools(
  jwtToken: string,
): Promise<UserSchoolInfo[]> {
  try {
    const res = await client.get<UserSchoolInfo[]>('/my-schools', {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    return res.data;
  } catch (err: unknown) {
    throw new Error(
      getErrorMessage(err, 'Ошибка при загрузке списка школ')
    );
  }
}
