import {useLocation, useParams, useSearchParams} from "react-router-dom";
import TextEditor from "./Components/TextEditor/TextEditor.tsx";
import './LessonIdPage.css';
import { Box, Skeleton, Typography } from '@mui/material';
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
    <Box className='lesson-id-page'>
      <Typography
        variant="h1"
        className={`lesson-name ${isEditMode ? 'editable' : ''}`}
        contentEditable={isEditMode}
      >{title}</Typography>
      <Suspense fallback={<SkeletonBox />}>
        <TextEditor
          isEditMode={isEditMode}
          id={id!}
          editorStatePromise={editorStatePromise}
        />
      </Suspense>
    </Box>
  )
}

function SkeletonBox() {
  return (
    <Box className="editor-input" sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <Skeleton variant="rectangular" sx={{ width: '50%', margin: '1rem auto', height: '1.5rem', borderRadius: '10px' }} />
      <Skeleton variant="rectangular" sx={{ width: '70%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '100%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '95%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '100%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '85%', borderRadius: '10px', height: '1rem' }} />

      <Skeleton variant="rectangular" sx={{ width: '40%', margin: '2rem auto 1rem auto', height: '1.2rem', borderRadius: '10px' }} />
      <Skeleton variant="rectangular" sx={{ width: '100%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '100%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '92%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '88%', borderRadius: '10px', height: '1rem' }} />

      <Skeleton variant="rectangular" sx={{ width: '100%', borderRadius: '10px', height: '1rem' }} />
      <Skeleton variant="rectangular" sx={{ width: '97%', borderRadius: '10px', height: '1rem' }} />
    </Box>
  );
}
