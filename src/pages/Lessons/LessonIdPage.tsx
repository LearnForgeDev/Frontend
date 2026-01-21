import {useParams, useSearchParams} from "react-router-dom";
import TextEditor from "../../components/lessons/TextEditor.tsx";
import '../../styles/pages/Lessons/LessonIdPage.css';

export default function LessonIdPage() {
  // TODO: Добавить проверку на существование lessonId
  // TODO: Добавить проверку на возможность редактирования урока
  // TODO: Добавить подгрузку данных урока по lessonId
  const { lessonId } = useParams() as { lessonId: string };
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  return (
    <div className='lesson-id-page'>
      <h1
        className={`lesson-name ${isEditMode ? 'editable' : ''}`}
        contentEditable={isEditMode}
      >Страница урока</h1>
      { isEditMode
        ? ( <TextEditor /> )
        : ( <p>Просмотр урока с ID: {lessonId}</p> )
      }
    </div>
  )
}