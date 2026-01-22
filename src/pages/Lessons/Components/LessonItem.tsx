import type {lessonCompactObject} from "../../../types/lessonTypes.ts";
import LessonItemIcon from "../../../assets/images/LessonItemIcon.tsx";
import "../../../styles/pages/Lessons/components/lessonItem.css";
import type {MouseEvent} from "react";

export function LessonItem(
  { id,
    title,
    isEditable,
    handleEdit,
    handleClick,
  }: lessonCompactObject &
    {
      isEditable?: boolean,
      handleEdit: (id: number | string, title: string) => void,
      handleClick: (id: number | string, title: string) => void,
    }) {
  return (
    <div
      className="lesson-item"
      key={id}
      onClick={() => handleClick(id, title)}
    >
      <LessonItemIcon size={28} color="var(--accent)" />
      <span>{title}</span>
      {isEditable && (
        <div className='controls'>
          <button
            className="edit-lesson-button"
            aria-label={`Редактировать ${title}`}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.stopPropagation();
              handleEdit(id, title);
            }}>
            ✏️
          </button>
          <button className="delete-lesson-button" aria-label={`Удалить ${title}`} onClick={(event: MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
          }}>
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}