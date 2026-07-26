import {
  Box,
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  CardActions,
} from "@mui/material";
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolsEndpoints, type UserSchoolInfo } from '@/Endpoints';
import { authEndpoints } from '@/Endpoints';
import { useUser } from '@/Storage/UserContext/UserContext.tsx';
import { useSchoolRequestPolling } from '@/Services/AdminPanel/hooks/useSchoolRequestPolling';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext.ts';

export default function SchoolsPage() {
  const { user, setUser } = useUser();
  const { startPolling } = useSchoolRequestPolling();
  const navigate = useNavigate();

  const [schools, setSchools] = useState<UserSchoolInfo[]>([]);
  const [isLoadingSchools, setIsLoadingSchools] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [inviteToken, setInviteToken] = useState("");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const fetchData = useCallback(async () => {
    if (!user?.jwtToken) {
      setIsLoadingSchools(false);
      return;
    }

    setIsLoadingSchools(true);
    setFetchError(null);
    try {
      const schoolsData = await schoolsEndpoints.getMySchools();
      setSchools(schoolsData);
    } catch (err: unknown) {
      setFetchError(
        err instanceof Error ? err.message : "Не удалось загрузить данные",
      );
    } finally {
      setIsLoadingSchools(false);
    }
  }, [user?.jwtToken]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();

    // Listen for custom event when school is created by polling
    const handleCreated = () => fetchData();
    window.addEventListener("school-created", handleCreated);
    return () => window.removeEventListener("school-created", handleCreated);
  }, [fetchData]);

  const handleJoinSchool = async () => {
    setJoinError(null);
    if (inviteToken.trim().length === 0) {
      setJoinError("Введите корректный инвайт-токен");
      return;
    }

    if (!user?.jwtToken) {
      setJoinError("Сессия истекла. Пожалуйста, войдите снова.");
      return;
    }

    setIsJoining(true);
    try {
      const result = await authEndpoints.joinSchool({ inviteToken: inviteToken.trim() });
      useGlobalContext.getState().auth.setUser(result);
      setUser(result);
      setInviteToken("");
      fetchData();
    } catch (err: unknown) {
      setJoinError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCreateSchool = async () => {
    setCreateError(null);
    if (newSchoolName.trim().length === 0) {
      setCreateError("Введите название школы");
      return;
    }

    setIsCreating(true);
    try {
      if (!user?.jwtToken) {
        throw new Error("Сессия истекла. Пожалуйста, войдите снова.");
      }
      const result = await authEndpoints.requestSchool({ schoolName: newSchoolName.trim() });

      if (result.requestPublicId) {
        startPolling(result.requestPublicId, newSchoolName.trim());
      }

      setNewSchoolName("");
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setIsCreating(false);
    }
  };

  const formatRoles = (roles: string[]) => {
    const roleMap: Record<string, string> = {
      Teacher: "Преподаватель",
      Student: "Студент",
      Founder: "Основатель",
      Admin: "Администратор",
    };
    return roles.map((r) => roleMap[r] || r).join(", ");
  };

  const handleNavigateToSchool = (school: UserSchoolInfo) => {
    navigate(`/admin/schools/${school.schoolPublicId}`, {
      state: { schoolName: school.schoolName },
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontFamily: "Manrope, sans-serif",
            fontWeight: 800,
            color: "var(--admin-text)",
          }}
        >
          Мои школы
        </Typography>
        <Typography sx={{ color: "var(--admin-muted)", marginTop: "0.5rem" }}>
          Управляйте своими школами: присоединяйтесь по токену или создавайте
          новые.
        </Typography>
      </Box>

      {fetchError && <Alert severity="error">{fetchError}</Alert>}

      <Box>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
          Активные школы
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "1.5rem",
            minHeight: isLoadingSchools ? "100px" : "auto",
          }}
        >
          {isLoadingSchools ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                py: 4,
              }}
            >
              <CircularProgress />
            </Box>
          ) : schools.length === 0 ? (
            <Typography sx={{ color: "var(--admin-muted)", py: 2 }}>
              Вы пока не состоите ни в одной школе.
            </Typography>
          ) : (
            schools.map((school) => (
              <Card
                key={school.schoolPublicId}
                sx={{
                  borderRadius: "1rem",
                  border: "1px solid var(--admin-border)",
                  boxShadow: "var(--admin-shadow)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {school.schoolName}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--admin-muted)", mt: 1 }}
                  >
                    Моя роль: {formatRoles(school.roles)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ px: 2, pb: 2 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    fullWidth
                    onClick={() => handleNavigateToSchool(school)}
                    sx={{ textTransform: "none", borderRadius: "0.7rem" }}
                  >
                    Перейти
                  </Button>
                </CardActions>
              </Card>
            ))
          )}
        </Box>
      </Box>

      <Divider />

      <Box sx={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
        {/* Join School Section */}
        <Box
          sx={{
            flex: 1,
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontFamily: "Manrope, sans-serif", fontWeight: 700 }}
          >
            Присоединиться к школе
          </Typography>
          <TextField
            label="Инвайт-токен"
            variant="outlined"
            value={inviteToken}
            onChange={(e) => setInviteToken(e.target.value)}
            error={!!joinError}
            helperText={joinError}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleJoinSchool}
            disabled={isJoining}
            sx={{ alignSelf: "flex-start" }}
          >
            {isJoining ? "Присоединение..." : "Присоединиться"}
          </Button>
        </Box>

        {/* Create School Section */}
        <Box
          sx={{
            flex: 1,
            minWidth: "300px",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontFamily: "Manrope, sans-serif", fontWeight: 700 }}
          >
            Создать новую школу
          </Typography>
          <TextField
            label="Название школы"
            variant="outlined"
            value={newSchoolName}
            onChange={(e) => setNewSchoolName(e.target.value)}
            error={!!createError}
            helperText={createError}
            fullWidth
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleCreateSchool}
            disabled={isCreating}
            sx={{ alignSelf: "flex-start" }}
          >
            {isCreating ? "Отправка..." : "Отправить заявку"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
