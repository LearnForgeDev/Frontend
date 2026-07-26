import { Box, Button, Card, CardActions, CardContent, Typography, Skeleton } from "@mui/material";
import { type UserSchoolInfo } from '@/Endpoints';
import UserIcon from '@/Assets/Components/UserIcon/UserIcon';
import { formatRoles, shortenString } from '@/Assets/globalUtils';
import { useState } from 'react';
import {
  IconButton, Dialog, DialogTitle, DialogContent, DialogContentText,
  DialogActions, Menu, MenuItem, ListItemIcon, ListItemText, TextField
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import { useToast } from '@/Storage/useToastStore';

interface ActiveSchoolsListProps {
  schools: UserSchoolInfo[];
  isLoading: boolean;
  onNavigateToSchool: (school: UserSchoolInfo) => void;
  onAddSchoolClick: () => void;
}

export default function ActiveSchoolsList({ schools, isLoading, onNavigateToSchool, onAddSchoolClick }: ActiveSchoolsListProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [activeSchool, setActiveSchool] = useState<UserSchoolInfo | null>(null);
  const [schoolToDelete, setSchoolToDelete] = useState<UserSchoolInfo | null>(null);
  const [schoolToRename, setSchoolToRename] = useState<UserSchoolInfo | null>(null);
  const toast = useToast();

  const handleOpenMenu = (e: React.MouseEvent<HTMLElement>, school: UserSchoolInfo) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
    setActiveSchool(school);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDeleteClick = () => {
    setSchoolToDelete(activeSchool);
    handleCloseMenu();
  };

  const handleRenameClick = () => {
    setSchoolToRename(activeSchool);
    handleCloseMenu();
  };

  const handleCloseDeleteModal = () => {
    setSchoolToDelete(null);
  };

  const handleConfirmDelete = () => {
    toast.error('Бэкенду нужно поработать');
    setSchoolToDelete(null);
  };

  const handleConfirmRename = () => {
    toast.error('Бэкенду нужно поработать');
    setSchoolToRename(null);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
          minHeight: isLoading ? "100px" : "auto",
        }}
      >
        {isLoading ? (
          Array.from(new Array(3)).map((_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              width="100%"
              height={160}
              sx={{
                borderRadius: '1rem',
                display: index > 0 ? { xs: 'none', sm: 'block' } : 'block'
              }}
            />
          ))
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
                '&:hover .school-actions-btn': { opacity: 1 },
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, wordBreak: "break-word" }}>
                    {shortenString(school.schoolName, 64)}
                  </Typography>
                  <IconButton
                    size="small"
                    className="school-actions-btn"
                    onClick={(e) => handleOpenMenu(e, school)}
                    sx={{ ml: 1, mt: -0.5, mr: -0.5, opacity: { xs: 1, sm: 0 }, transition: 'opacity 0.2s' }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: "var(--admin-muted)",
                    mt: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}
                >
                  <UserIcon fontSize="small" />
                  Моя роль: {formatRoles(school.roles)}
                </Typography>
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  size="small"
                  variant="outlined"
                  fullWidth
                  onClick={() => onNavigateToSchool(school)}
                  sx={{ textTransform: "none", borderRadius: "0.7rem" }}
                >
                  Перейти
                </Button>
              </CardActions>
            </Card>
          ))
        )}

        {/* Dotted border Add School button */}
        {!isLoading && (
          <Box
            onClick={onAddSchoolClick}
            sx={{
              borderRadius: "1rem",
              border: "2px dashed var(--admin-outline)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              minHeight: "160px",
              color: "var(--admin-muted)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "rgba(0,0,0,0.02)",
                color: "var(--admin-text)",
                borderColor: "var(--admin-text)",
              }
            }}
          >
            <Typography variant="h3" sx={{ mb: 1, fontWeight: 300, lineHeight: 1 }}>+</Typography>
            <Typography variant="body1" sx={{ fontWeight: 600 }}>Добавить школу</Typography>
          </Box>
        )}
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{ paper: { sx: { borderRadius: '0.75rem', minWidth: 160 } } }}
      >
        <MenuItem onClick={handleRenameClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Переименовать</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Удалить</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog open={!!schoolToRename} onClose={() => setSchoolToRename(null)}>
        <DialogTitle>Переименование школы</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Введите новое название для школы "{schoolToRename?.schoolName}":
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            defaultValue={schoolToRename?.schoolName}
            size="small"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSchoolToRename(null)} color="inherit">
            Отмена
          </Button>
          <Button onClick={handleConfirmRename} color="primary" variant="contained" disableElevation>
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={!!schoolToDelete} onClose={handleCloseDeleteModal}>
        <DialogTitle>Удаление школы</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить школу "{schoolToDelete?.schoolName}"? Это действие необратимо.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteModal} color="inherit">
            Отмена
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disableElevation>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
