import type {lessonObject} from "../../types/lessonTypes.ts";
import LessonItemIcon from "../../assets/images/LessonItemIcon.tsx";
import "../../styles/pages/Lessons/components/lessonItem.css";

export function LessonItem({ id, title, isEditable, handleEdit }: lessonObject & { isEditable?: boolean, handleEdit: (id: number | string) => void }) {
  return (
    <div className="lesson-item" key={id}>
      <LessonItemIcon size={28} color="var(--accent)" />
      <span>{title}</span>
      {isEditable && (
        <div className='controls'>
          <button className="edit-lesson-button" aria-label={`Редактировать ${title}`} onClick={() => handleEdit(id)}>
            ✏️
          </button>
          <button className="delete-lesson-button" aria-label={`Удалить ${title}`}>
            🗑️
          </button>
        </div>
      )}
    </div>
  );
}