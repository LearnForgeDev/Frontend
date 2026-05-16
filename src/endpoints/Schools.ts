import config from "../config.ts";

const BASE_PATH = `${config.endpointUrl}/api/ApiSchool`;

export type SchoolRole = "Teacher" | "Student" | "Founder" | "Admin";

export type UserSchoolInfo = {
  schoolPublicId: string;
  schoolName: string;
  roles: SchoolRole[];
};

export async function getMySchools(
  jwtToken: string,
): Promise<UserSchoolInfo[]> {
  console.log(`[API Request] GET ${BASE_PATH}/my-schools`);
  const res = await fetch(`${BASE_PATH}/my-schools`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
  });

  console.log(`[API Response] ${res.status} ${res.statusText}`);
  if (!res.ok) {
    console.error(`[API Error] Status: ${res.status}`);
    throw new Error(
      `Ошибка при загрузке списка школ: ${res.status} ${res.statusText}`,
    );
  }

  const data = await res.json();
  console.log(`[API Data]`, data);
  return data;
}
