import { Breadcrumbs, Link, Typography, Box } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import type { LessonFolder } from '@/Services/Lessons/components/FileManager/FileManager.types';
import { getBreadcrumbPath } from '@/Services/Lessons/components/FileManager/utils';
import { styles } from './FolderBreadcrumb.styles';

export interface FolderBreadcrumbProps {
  folders: LessonFolder[];
  currentFolderId: string | null;
  onNavigate: (id: string | null) => void;
}

export default function FolderBreadcrumb({ folders, currentFolderId, onNavigate }: FolderBreadcrumbProps) {
  const path = getBreadcrumbPath(folders, currentFolderId);

  return (
    <Box sx={styles.container}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        {currentFolderId === null ? (
          <Typography sx={styles.currentFolder}>Мои уроки</Typography>
        ) : (
          <Link
            underline="hover"
            sx={styles.rootLink}
            onClick={() => onNavigate(null)}
            aria-label="Перейти к Мои уроки"
          >
            Мои уроки
          </Link>
        )}

        {path.map((folder, idx) => {
          const isLast = idx === path.length - 1;
          if (isLast) {
            return (
              <Typography key={folder.id} sx={styles.currentFolder} aria-current="page">
                {folder.name}
              </Typography>
            );
          }
          return (
            <Link
              key={folder.id}
              underline="hover"
              sx={styles.folderLink}
              onClick={() => onNavigate(folder.id)}
              aria-label={`Перейти к папке ${folder.name}`}
            >
              {folder.name}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
}
