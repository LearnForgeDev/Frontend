import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import {
  ApiError,
  completeDirectUpload,
  deleteSchoolFile,
  downloadSchoolFileContent,
  getSchoolFiles,
  requestDirectUpload,
  uploadToPresignedUrl,
} from "../../../endpoints/files";
import type { SchoolFileItem } from "../../../types/schoolTypes";
import { useUser } from "../../../contexts/UserContext";
import {
  cardHeaderSx,
  cardSx,
  fileActionsSx,
  fileListSx,
  fileMetaSx,
  fileNameSx,
  fileRowSx,
  headerRowSx,
  helperTextSx,
  pageSx,
  progressRowSx,
  statusChipSx,
  uploadActionsSx,
  uploadFormSx,
  uploadRowSx,
} from "./SchoolFilesPage.styles";
import { calculateFileMd5 } from "../../../pages/Auth/utils";

type UploadState = {
  status: "idle" | "uploading" | "success" | "error" | "canceled";
  progress: number;
  message?: string;
};

const MAX_FILE_SIZE_BYTES = 200 * 1024 * 1024;

const SchoolFilesPage = () => {
  const { schoolPublicId } = useParams();
  const navigate = useNavigate();
  const { user, clearUser } = useUser();
  const [files, setFiles] = useState<SchoolFileItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("");
  const [allowedUsers, setAllowedUsers] = useState("");
  const [allowedGroups, setAllowedGroups] = useState("");
  const [uploadState, setUploadState] = useState<UploadState>({
    status: "idle",
    progress: 0,
  });
  const uploadAbortRef = useRef<() => void>(() => undefined);

  const accessPayload = useMemo(
    () => ({
      allowedUserPublicIds: parseCommaList(allowedUsers),
      allowedGroupIds: parseCommaList(allowedGroups),
    }),
    [allowedGroups, allowedUsers],
  );

  const handleApiError = useCallback(
    (err: unknown) => {
      if (err instanceof ApiError) {
        setError(err.message);
        if (err.status === 401) {
          clearUser();
          navigate("/auth/login");
        }
        return;
      }

      setError(
        err instanceof Error ? err.message : "Не удалось получить файлы.",
      );
    },
    [clearUser, navigate],
  );

  const loadFiles = useCallback(async () => {
    if (!schoolPublicId || !user?.jwtToken) {
      console.log(
        "[SchoolFilesPage] Missing schoolPublicId or jwtToken, skipping load",
      );
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log(
        `[SchoolFilesPage] Loading files for school: ${schoolPublicId}`,
      );
      const response = await getSchoolFiles(schoolPublicId, user.jwtToken);
      console.log("[SchoolFilesPage] Files loaded successfully:", response);
      setFiles(response);
    } catch (err) {
      console.error("[SchoolFilesPage] Error loading files:", err);
      handleApiError(err);
    } finally {
      setIsLoading(false);
    }
  }, [handleApiError, schoolPublicId, user?.jwtToken]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const handleDownload = async (file: SchoolFileItem) => {
    if (!schoolPublicId || !user?.jwtToken) {
      return;
    }

    try {
      const blob = await downloadSchoolFileContent(
        schoolPublicId,
        file.publicId,
        user.jwtToken,
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleDelete = async (file: SchoolFileItem) => {
    if (!schoolPublicId || !user?.jwtToken) {
      return;
    }

    try {
      await deleteSchoolFile(schoolPublicId, file.publicId, user.jwtToken);
      setFiles((prev) =>
        prev.filter((item) => item.publicId !== file.publicId),
      );
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleUpload = async () => {
    console.log("[SchoolFilesPage] handleUpload triggered", {
      schoolPublicId,
      hasUser: !!user,
      hasToken: !!user?.jwtToken,
    });

    if (!schoolPublicId || !user?.jwtToken) {
      console.error("[SchoolFilesPage] Upload aborted: missing identifiers", {
        schoolPublicId,
        jwtToken: user?.jwtToken ? "exists" : "missing",
      });
      setUploadState({
        status: "error",
        progress: 0,
        message: "Ошибка авторизации или ID школы не найден.",
      });
      return;
    }

    if (!selectedFile) {
      setUploadState({
        status: "error",
        progress: 0,
        message: "Выберите файл для загрузки.",
      });
      return;
    }

    if (selectedFile.size === 0 || selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setUploadState({
        status: "error",
        progress: 0,
        message: "Некорректный размер файла.",
      });
      return;
    }

    setUploadState({
      status: "uploading",
      progress: 0,
      message: "Расчет MD5...",
    });

    const controller = new AbortController();
    uploadAbortRef.current = () => controller.abort();

    try {
      const computedMd5 = await calculateFileMd5(selectedFile);
      console.log(`[SchoolFilesPage] Computed MD5: ${computedMd5}`);

      const presign = await requestDirectUpload(
        schoolPublicId,
        user.jwtToken,
        {
          fileName: selectedFile.name,
          sizeBytes: Number(selectedFile.size),
          mimeType: selectedFile.type || "application/octet-stream",
          contentMd5: computedMd5,
        },
        controller.signal,
      );

      // Важно: не меняем presign.uploadUrl, так как это ломает подпись S3.
      // Вместо этого добавьте '127.0.0.1 minio' в ваш /etc/hosts.
      const uploadUrl = presign.uploadUrl;
      console.log(`[SchoolFilesPage] Uploading to: ${uploadUrl}`);

      const uploadHeaders: Record<string, string> = {
        ...presign.headers,
        "Content-Type": selectedFile.type || "application/octet-stream",
        "Content-MD5": computedMd5,
      };

      const uploadTask = uploadToPresignedUrl(
        uploadUrl,
        selectedFile,
        uploadHeaders,
        (progress) => setUploadState((prev) => ({ ...prev, progress })),
        controller.signal,
      );

      uploadAbortRef.current = () => {
        uploadTask.abort();
        controller.abort();
      };

      await uploadTask.promise;

      const completionPayload: DirectUploadCompleteRequest = {
        storageKey: presign.storageKey,
        fileName: fileName.trim() || selectedFile.name,
        sizeBytes: Number(selectedFile.size),
        mimeType: selectedFile.type || "application/octet-stream",
        allowedUserPublicIds: accessPayload.allowedUserPublicIds,
        allowedGroupIds: accessPayload.allowedGroupIds,
      };

      console.log(
        "[SchoolFilesPage] Sending completion request:",
        completionPayload,
      );

      const completeResponse = await completeDirectUpload(
        schoolPublicId,
        user.jwtToken,
        completionPayload,
        controller.signal,
      );

      setFiles((prev) => [completeResponse, ...prev]);
      setUploadState({
        status: "success",
        progress: 100,
        message: "Файл загружен.",
      });
      resetUploadForm();
    } catch (err) {
      handleUploadError(err);
    }
  };

  const handleUploadError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 499) {
      setUploadState({
        status: "canceled",
        progress: 0,
        message: "Загрузка отменена.",
      });
      return;
    }

    if (err instanceof ApiError) {
      setUploadState({ status: "error", progress: 0, message: err.message });
      if (err.status === 401) {
        clearUser();
        navigate("/auth/login");
      }
      return;
    }

    setUploadState({
      status: "error",
      progress: 0,
      message: "Не удалось загрузить файл.",
    });
  };

  const resetUploadForm = () => {
    setSelectedFile(null);
    setFileName("");
    setAllowedUsers("");
    setAllowedGroups("");
  };

  const handleCancelUpload = () => {
    uploadAbortRef.current?.();
    setUploadState({
      status: "canceled",
      progress: 0,
      message: "Загрузка отменена.",
    });
  };

  return (
    <Box sx={pageSx} className="admin-page">
      <Box sx={headerRowSx}>
        <Box>
          <Typography component="h1" className="admin-page-title">
            Файлы школы
          </Typography>
          <Typography className="admin-page-description">
            Каталог материалов, загрузка и управление доступом.
          </Typography>
        </Box>
        <Button className="admin-button" onClick={loadFiles}>
          Обновить
        </Button>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={7}>
          <Box className="admin-card" sx={cardSx}>
            <Box sx={cardHeaderSx}>
              <Typography
                component="h2"
                sx={{ fontFamily: "Manrope, sans-serif", fontWeight: 700 }}
              >
                Каталог
              </Typography>
              <Chip
                label={`${files.length} файлов`}
                size="small"
                sx={statusChipSx}
              />
            </Box>
            <Divider />
            {error && <Alert severity="error">{error}</Alert>}
            {isLoading && <LinearProgress />}
            {!isLoading && files.length === 0 && (
              <Box className="admin-empty-state">
                <Typography>Файлы пока не загружены.</Typography>
              </Box>
            )}
            <Box sx={fileListSx}>
              {files.map((file) => (
                <Box key={file.publicId} sx={fileRowSx}>
                  <Box sx={fileMetaSx}>
                    <Typography sx={fileNameSx}>{file.fileName}</Typography>
                    <Typography sx={helperTextSx}>
                      {formatFileSize(file.sizeBytes)} ·{" "}
                      {file.mimeType || "unknown"}
                    </Typography>
                  </Box>
                  <Box sx={fileActionsSx}>
                    <IconButton
                      aria-label="Скачать файл"
                      onClick={() => handleDownload(file)}
                    >
                      <Box
                        component="span"
                        className="material-symbols-outlined"
                      >
                        download
                      </Box>
                    </IconButton>
                    <IconButton
                      aria-label="Удалить файл"
                      onClick={() => handleDelete(file)}
                    >
                      <Box
                        component="span"
                        className="material-symbols-outlined"
                      >
                        delete
                      </Box>
                    </IconButton>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Grid>
        <Grid item xs={12} lg={5}>
          <Box className="admin-card" sx={cardSx}>
            <Box sx={cardHeaderSx}>
              <Typography
                component="h2"
                sx={{ fontFamily: "Manrope, sans-serif", fontWeight: 700 }}
              >
                Загрузка
              </Typography>
              <Chip
                label="Direct Upload"
                size="small"
                className="admin-chip"
                sx={statusChipSx}
              />
            </Box>
            <Divider />
            <Box sx={uploadFormSx}>
              <Box sx={uploadRowSx}>
                <Button
                  variant="outlined"
                  component="label"
                  sx={{
                    textTransform: "none",
                    borderRadius: "0.7rem",
                    flex: 1,
                  }}
                >
                  {selectedFile ? "Файл выбран" : "Выбрать файл"}
                  <Box
                    component="input"
                    type="file"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0] ?? null;
                      setSelectedFile(file);
                    }}
                  />
                </Button>
                {selectedFile && (
                  <Typography
                    sx={{
                      ...helperTextSx,
                      ml: 1,
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {selectedFile.name}
                  </Typography>
                )}
              </Box>

              <TextField
                label="Имя файла (опционально)"
                value={fileName}
                onChange={(event) => setFileName(event.target.value)}
                size="small"
              />
              <TextField
                label="Allowed user IDs (через запятую)"
                value={allowedUsers}
                onChange={(event) => setAllowedUsers(event.target.value)}
                size="small"
              />
              <TextField
                label="Allowed group IDs (через запятую)"
                value={allowedGroups}
                onChange={(event) => setAllowedGroups(event.target.value)}
                size="small"
              />
              <Typography sx={helperTextSx}>
                Максимальный размер: {formatFileSize(MAX_FILE_SIZE_BYTES)}.
              </Typography>
              <Box sx={uploadActionsSx}>
                <Button
                  variant="contained"
                  onClick={handleUpload}
                  disabled={uploadState.status === "uploading"}
                  sx={{ borderRadius: "0.7rem", textTransform: "none" }}
                >
                  Загрузить
                </Button>
                <Button
                  variant="text"
                  onClick={handleCancelUpload}
                  disabled={uploadState.status !== "uploading"}
                  sx={{ textTransform: "none" }}
                >
                  Отменить
                </Button>
              </Box>
              {uploadState.status !== "idle" && (
                <Box sx={progressRowSx}>
                  <LinearProgress
                    variant="determinate"
                    value={uploadState.progress}
                    sx={{ flex: 1, borderRadius: "999px" }}
                  />
                  <Typography sx={helperTextSx}>
                    {uploadState.progress}%
                  </Typography>
                </Box>
              )}
              {uploadState.message && (
                <Alert
                  severity={
                    uploadState.status === "success"
                      ? "success"
                      : uploadState.status === "canceled"
                        ? "info"
                        : "error"
                  }
                >
                  {uploadState.message}
                </Alert>
              )}
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

function parseCommaList(value: string): string[] | undefined {
  const items = value
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
  return items.length > 0 ? items : undefined;
}

function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size} B`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(1)} MB`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(1)} GB`;
}

export default SchoolFilesPage;
