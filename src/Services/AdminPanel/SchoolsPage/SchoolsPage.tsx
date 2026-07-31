import { Box, Typography, Alert } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { type UserSchoolInfo } from '@/Endpoints';
import { useSchools } from './hooks/useSchools';
import { useState } from 'react';
import { useGlobalContext } from '@/Storage/useGlobalContext/useGlobalContext';
import ActiveSchoolsList from './Components/ActiveSchoolsList';
import AddSchoolModal from './Components/AddSchoolModal';

export default function SchoolsPage() {
  const navigate = useNavigate();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const activeSchoolPublicId = useGlobalContext(state => state.auth.user?.activeSchoolPublicId);
  const setActiveSchoolPublicId = useGlobalContext(state => state.auth.setActiveSchoolPublicId);

  const { data: schools, isLoading: isLoadingSchools, error: fetchError } = useSchools();

  const handleNavigateToSchool = (school: UserSchoolInfo) => {
    setActiveSchoolPublicId(school.schoolPublicId);
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
            marginTop: "8rem",
          }}
        >
          Мои школы
        </Typography>
      </Box>

      {fetchError && <Alert severity="error">Не удалось загрузить данные</Alert>}

      <ActiveSchoolsList
        schools={schools ?? []}
        isLoading={isLoadingSchools}
        onNavigateToSchool={handleNavigateToSchool}
        onAddSchoolClick={() => setAddModalOpen(true)}
        activeSchoolPublicId={activeSchoolPublicId}
      />

      <AddSchoolModal
        open={isAddModalOpen}
        onClose={() => setAddModalOpen(false)}
      />
    </Box>
  );
}
