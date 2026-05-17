import config from "../config.ts";
import type {
  DirectUploadCompleteRequest,
  DirectUploadPresignRequest,
  DirectUploadPresignResponse,
  SchoolFileAccess,
  SchoolFileItem,
} from "../types/schoolTypes.ts";

type UploadProgressHandler = (progress: number) => void;

type UploadTask<T> = {
  promise: Promise<T>;
  abort: () => void;
};

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

const BASE_PATH = `${config.endpointUrl}/api/ApiFiles`;

const defaultErrorMessages: Record<number, string> = {
  400: "Некорректные данные запроса.",
  401: "Сессия истекла. Требуется вход.",
  403: "Недостаточно прав для выполнения действия.",
  404: "Запрашиваемый ресурс не найден.",
  429: "Слишком много запросов. Попробуйте позже.",
  500: "Внутренняя ошибка сервера.",
};

function getDefaultMessage(status: number): string {
  return defaultErrorMessages[status] ?? `Ошибка запроса (${status}).`;
}

async function parseErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    try {
      const data = (await response.json()) as {
        message?: string;
        error?: string;
      };
      return data.message ?? data.error ?? getDefaultMessage(response.status);
    } catch {
      return getDefaultMessage(response.status);
    }
  }

  try {
    const text = await response.text();
    return text || getDefaultMessage(response.status);
  } catch {
    return getDefaultMessage(response.status);
  }
}

async function assertOk(response: Response): Promise<void> {
  if (response.ok) {
    return;
  }

  const message = await parseErrorMessage(response);
  throw new ApiError(response.status, message);
}

export async function getSchoolFiles(
  schoolPublicId: string,
  jwtToken: string,
): Promise<SchoolFileItem[]> {
  const response = await fetch(
    `${BASE_PATH}/${encodeURIComponent(schoolPublicId)}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  );

  await assertOk(response);
  const data = (await response.json()) as SchoolFileItem[];
  return data ?? [];
}

export async function requestDirectUpload(
  schoolPublicId: string,
  jwtToken: string,
  payload: DirectUploadPresignRequest,
  signal?: AbortSignal,
): Promise<DirectUploadPresignResponse> {
  const response = await fetch(
    `${BASE_PATH}/${encodeURIComponent(schoolPublicId)}/direct-upload/presign`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    },
  );

  await assertOk(response);
  return (await response.json()) as DirectUploadPresignResponse;
}

export function uploadToPresignedUrl(
  uploadUrl: string,
  file: File,
  headers: Record<string, string> = {},
  onProgress?: UploadProgressHandler,
  signal?: AbortSignal,
): UploadTask<void> {
  const xhr = new XMLHttpRequest();

  const promise = new Promise<void>((resolve, reject) => {
    xhr.open("PUT", uploadUrl);
    Object.entries(headers).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value);
    });

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }
      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress?.(progress);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(
        new ApiError(
          xhr.status,
          xhr.responseText || getDefaultMessage(xhr.status),
        ),
      );
    };

    xhr.onerror = () => {
      reject(new ApiError(500, "Не удалось загрузить файл в хранилище."));
    };

    if (signal) {
      signal.addEventListener("abort", () => {
        xhr.abort();
        reject(new ApiError(499, "Загрузка отменена."));
      });
    }

    xhr.send(file);
  });

  return {
    promise,
    abort: () => xhr.abort(),
  };
}

export async function completeDirectUpload(
  schoolPublicId: string,
  jwtToken: string,
  payload: DirectUploadCompleteRequest,
  signal?: AbortSignal,
): Promise<SchoolFileItem> {
  const response = await fetch(
    `${BASE_PATH}/${encodeURIComponent(schoolPublicId)}/direct-upload/complete`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(payload),
      signal,
    },
  );

  await assertOk(response);
  return (await response.json()) as SchoolFileItem;
}

export async function downloadSchoolFileContent(
  schoolPublicId: string,
  filePublicId: string,
  jwtToken: string,
): Promise<Blob> {
  const response = await fetch(
    `${BASE_PATH}/${encodeURIComponent(schoolPublicId)}/${encodeURIComponent(filePublicId)}/content`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  );

  await assertOk(response);
  return await response.blob();
}

export async function deleteSchoolFile(
  schoolPublicId: string,
  filePublicId: string,
  jwtToken: string,
): Promise<void> {
  const response = await fetch(
    `${BASE_PATH}/${encodeURIComponent(schoolPublicId)}/${encodeURIComponent(filePublicId)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    },
  );

  await assertOk(response);
}

export async function updateSchoolFileAccess(
  schoolPublicId: string,
  filePublicId: string,
  jwtToken: string,
  access: SchoolFileAccess,
): Promise<void> {
  const response = await fetch(
    `${BASE_PATH}/${encodeURIComponent(schoolPublicId)}/${encodeURIComponent(filePublicId)}/access`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwtToken}`,
      },
      body: JSON.stringify(access),
    },
  );

  await assertOk(response);
}
