import config from "../config.ts";
import type { BranchDto, BranchModel, ChatFileDto } from "../types/chatTypes";

const BASE_PATH = `${config.endpointUrl}/api/ApiBreanches`;

export async function getAllBranches(
  jwtToken: string,
  schoolPublicId: string,
): Promise<BranchDto[]> {
  const res = await fetch(`${BASE_PATH}/${schoolPublicId}/all`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });
  if (!res.ok) throw new Error("Failed to load branches");
  return res.json();
}

export async function getBranchFiles(
  jwtToken: string,
  schoolPublicId: string,
  branchId: number,
): Promise<ChatFileDto[]> {
  const res = await fetch(`${BASE_PATH}/${schoolPublicId}/${branchId}/files`, {
    headers: { Authorization: `Bearer ${jwtToken}` },
  });
  if (!res.ok) throw new Error("Failed to load branch files");
  return res.json();
}

export async function createBranch(
  jwtToken: string,
  schoolPublicId: string,
  model: BranchModel,
): Promise<void> {
  const res = await fetch(`${BASE_PATH}/${schoolPublicId}/createBreanch`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwtToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(model),
  });
  if (!res.ok) throw new Error("Failed to create branch");
}

export async function deleteBranch(
  jwtToken: string,
  schoolPublicId: string,
  branchId: number,
): Promise<void> {
  const res = await fetch(`${BASE_PATH}/${schoolPublicId}/${branchId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${jwtToken}` },
  });
  if (!res.ok) throw new Error("Failed to delete branch");
}
