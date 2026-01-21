import {useLocation, useSearchParams} from "react-router-dom";
import TextEditor from "../../components/lessons/TextEditor.tsx";
import '../../styles/pages/Lessons/LessonIdPage.css';
import type {viewLessonProps} from "../../types/lessonTypes.ts";

export default function LessonIdPage() {
  // TODO: Добавить проверку на существование lessonId
  // TODO: Добавить проверку на возможность редактирования урока
  // TODO: Добавить подгрузку данных урока по lessonId
  const { id, title } = useLocation().state as viewLessonProps;
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  return (
    <div className='lesson-id-page'>
      <h1
        className={`lesson-name ${isEditMode ? 'editable' : ''}`}
        contentEditable={isEditMode}
      >{title}</h1>
      <TextEditor
        isEditMode={isEditMode}
        id={id}
      />
    </div>
  )
}