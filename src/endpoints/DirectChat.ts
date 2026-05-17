import config from "../config.ts";
import type { ChatFileDto, DeletedMessagesDto } from "../types/chatTypes";

const BASE_PATH = `${config.endpointUrl}/api/ApiDirectChat`;

export async function getDirectChatFiles(
  jwtToken: string,
  schoolPublicId: string,
  otherUserPublicId: string,
): Promise<ChatFileDto[]> {
  const res = await fetch(
    `${BASE_PATH}/${schoolPublicId}/files/${otherUserPublicId}`,
    {
      headers: { Authorization: `Bearer ${jwtToken}` },
    },
  );
  if (!res.ok) throw new Error("Failed to load chat files");
  return res.json();
}

export async function deleteDirectChatHistory(
  jwtToken: string,
  schoolPublicId: string,
  otherUserPublicId: string,
): Promise<DeletedMessagesDto> {
  const res = await fetch(
    `${BASE_PATH}/${schoolPublicId}/history/${otherUserPublicId}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${jwtToken}` },
    },
  );
  if (!res.ok) throw new Error("Failed to delete chat history");
  return res.json();
}
