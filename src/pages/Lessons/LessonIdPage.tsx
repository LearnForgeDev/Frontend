import {useLocation, useSearchParams} from "react-router-dom";
import TextEditor from "./Components/TextEditor.tsx";
import '../../styles/pages/Lessons/LessonIdPage.css';
import type {viewLessonProps} from "../../types/lessonTypes.ts";
import {Suspense, useMemo} from "react";
import {MoonLoader} from "react-spinners";
import {getEditorStateAsJson} from "../../server/Lessons.ts";

export default function LessonIdPage() {
  // TODO: Добавить проверку на существование lessonId
  // TODO: Добавить проверку на возможность редактирования урока
  // TODO: Добавить подгрузку данных урока по lessonId
  const { id, title } = useLocation().state as viewLessonProps;
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const editorStatePromise = useMemo(() => getEditorStateAsJson(id), [id]);

  return (
    <div className='lesson-id-page'>
      <h1
        className={`lesson-name ${isEditMode ? 'editable' : ''}`}
        contentEditable={isEditMode}
      >{title}</h1>
      <Suspense fallback={<MoonLoader />}>
        <TextEditor
          isEditMode={isEditMode}
          id={id}
          editorStatePromise={editorStatePromise}
        />
      </Suspense>
    </div>
  )
}
