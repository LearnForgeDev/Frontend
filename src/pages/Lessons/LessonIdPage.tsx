import {useLocation, useParams, useSearchParams} from "react-router-dom";
import TextEditor from "./Components/TextEditor.tsx";
import './LessonIdPage.css';
import type {viewLessonProps} from "../../types/lessonTypes.ts";
import {Suspense, useMemo} from "react";

export default function LessonIdPage() {
  // TODO: Добавить проверку на существование lessonId
  // TODO: Добавить проверку на возможность редактирования урока
  // TODO: Добавить подгрузку данных урока по lessonId
  const { id: paramId } = useParams<{id: string}>();
  const locationState = useLocation()?.state as viewLessonProps | null;
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';

  const id = locationState?.id ?? paramId;
  const title = locationState?.title ?? 'Loading...';

  const editorStatePromise = useMemo(() => Promise.resolve(undefined), [id]);

  return (
    <div className='lesson-id-page'>
      <h1
        className={`lesson-name ${isEditMode ? 'editable' : ''}`}
        contentEditable={isEditMode}
      >{title}</h1>
      <Suspense fallback={<SkeletonBox />}>
        <TextEditor
          isEditMode={isEditMode}
          id={id!}
          editorStatePromise={editorStatePromise}
        />
      </Suspense>
    </div>
  )
}

function SkeletonBox() {
  return (
    <div className="editor-input" style={{display: 'flex', flexDirection: 'column', gap: "1rem"}} >
      <div className='skeleton-animation' style={{width: '50%', margin: '1rem auto', height: '1.5rem', borderRadius: 10}}></div>
      <div className='skeleton-animation' style={{width: '70%', borderRadius: 10, height: '1rem'}}></div>
      <div className='skeleton-animation' style={{width: '100%', borderRadius: 10, height: '1rem'}}></div>
      <div className='skeleton-animation' style={{width: '95%', borderRadius: 10, height: '1rem'}}></div>
      <div className='skeleton-animation' style={{width: '100%', borderRadius: 10, height: '1rem'}}></div>
      <div className='skeleton-animation' style={{width: '85%', borderRadius: 10, height: '1rem'}}></div>

      <div className='skeleton-animation' style={{width: '40%', margin: '2rem auto 1rem auto', height: '1.2rem', borderRadius: 10}}></div>
      <div className='skeleton-animation' style={{width: '100%', borderRadius: 10, height: '1rem'}}></div>
      <div className='skeleton-animation' style={{width: '100%', borderRadius: 10, height: '1rem'}}></div>
      <div className='skeleton-animation' style={{width: '92%', borderRadius: 10, height: '1rem'}}></div>
      <div className='skeleton-animation' style={{width: '88%', borderRadius: 10, height: '1rem'}}></div>

      <div className='skeleton-animation' style={{width: '100%', borderRadius: 10, height: '1rem'}}></div>
      <div className='skeleton-animation' style={{width: '97%', borderRadius: 10, height: '1rem'}}></div>
    </div>
  );
}
