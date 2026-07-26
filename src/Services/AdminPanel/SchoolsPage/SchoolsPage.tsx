import { Box, Typography, Alert } from "@mui/material";
import { useNavigate } from 'react-router-dom';
import { type UserSchoolInfo } from '@/Endpoints';
import { useSchools } from './hooks/useSchools';
import { useState } from 'react';
import ActiveSchoolsList from './Components/ActiveSchoolsList';
import AddSchoolModal from './Components/AddSchoolModal';

export default function SchoolsPage() {
  const navigate = useNavigate();
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  const { data: schools = [], isLoading: isLoadingSchools, error: fetchError } = useSchools();

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
      </Box>

      {fetchError && <Alert severity="error">{fetchError instanceof Error ? fetchError.message : "Не удалось загрузить данные"}</Alert>}

      <ActiveSchoolsList 
        schools={schools} 
        isLoading={isLoadingSchools} 
        onNavigateToSchool={handleNavigateToSchool} 
        onAddSchoolClick={() => setAddModalOpen(true)}
      />

      <AddSchoolModal 
        open={isAddModalOpen} 
        onClose={() => setAddModalOpen(false)} 
      />
    </Box>
  );
}
