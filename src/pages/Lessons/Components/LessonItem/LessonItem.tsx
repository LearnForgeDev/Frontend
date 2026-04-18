import type {lessonCompactObject} from "../../../../types/lessonTypes.ts";
import LessonItemIcon from "../../../../assets/images/LessonItemIcon.tsx";
import { Box, Typography, IconButton } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import './LessonItem.css';
import type {MouseEvent, JSX} from "react";

export function LessonItem(
  {
    id,
    title,
    isEditable,
    handleEdit,
    handleClick,
  }: lessonCompactObject &
    {
      isEditable?: boolean,
      handleEdit: (id: number | string, title: string) => void,
      handleClick: (id: number | string, title: string) => void,
    }): JSX.Element {
  return (
    <Box
      className="lesson-item"
      key={id}
      onClick={() => handleClick(id, title)}
      sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
    >
      <LessonItemIcon size={28} color="var(--accent)" />
      <Typography component="span">{title}</Typography>
      {isEditable && (
        <Box className='controls'>
          <IconButton
            className="edit-lesson-button"
            aria-label={`Редактировать ${title}`}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              handleEdit(id, title);
            }}
            size="small"
          >
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton
            className="delete-lesson-button" 
            aria-label={`Удалить ${title}`} 
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
            }}
            size="small"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      )}
    </Box>
  );
}
