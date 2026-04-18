import type {viewLessonProps, lessonCompactObject} from "../../types/lessonTypes.ts";
import {LessonItem} from "./Components/LessonItem/LessonItem.tsx";
import './LessonsMainPage.css';
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import { Box, Typography, Button, Skeleton } from "@mui/material";

export default function LessonsMainPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<lessonCompactObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getMockLessons()
      .then((data) => { if (active) setLessons(data); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const viewLesson = (
    isEditMode: boolean,
    id: number | string,
    title: string
  ) => {
    // I don't want to expose edit mode to a user when they are just viewing a lesson`
    const path = isEditMode ? `/Lessons/${id}?edit=true` : `/Lessons/${id}`;

    navigate(path, {
      state: {
        id,
        title,
      } as viewLessonProps,
    });
  }

  return (
    <Box className='lessons-main-page'>
      <Box component="header">
        <Typography variant="h4" component="h1">Мои уроки</Typography>
      </Box>
      <Box component="main">
        {loading && <LessonsSkeletonLoader />}
        {!loading && error && (
          <Typography className='placeholderText'>Не удалось загрузить уроки: {error}</Typography>
        )}
        {!loading && !error && (
          <>
            {lessons.length === 0 ? (
              <PlaceHolder />
            ) : (
              <>
                {lessons.map((lesson) => (
                  <LessonItem
                    id={lesson.id}
                    title={lesson.title}
                    isEditable={true}
                    handleEdit={(id: string | number, title: string) => viewLesson(true, id, title)}
                    handleClick={(id: string | number, title: string) => viewLesson(false, id, title)}
                    key={lesson.id}
                  />
                ))}
              </>
            )}
          </>
        )}
        <Button variant="contained" className="create-lesson-button" aria-label="Создать новый урок">
          Создать урок
        </Button>
      </Box>
    </Box>
  );
}

function LessonsSkeletonLoader() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} variant="rectangular" height={60} sx={{ mb: 2, borderRadius: 1 }} />
      ))}
    </>
  );
}

function PlaceHolder() {
  return <Typography className='placeholderText'>У Вас пока нет уроков. Добавим парочку?</Typography>;
}

const MOCK_LESSONS: lessonCompactObject[] = [
  { id: 1, title: "Введение в математику" },
  { id: 2, title: "Алгебра: линейные уравнения" },
  { id: 3, title: "Геометрия: теорема Пифагора" },
  { id: 4, title: "Физика: законы Ньютона" },
  { id: 5, title: "История: Древний Рим" },
];

async function getMockLessons(): Promise<lessonCompactObject[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(MOCK_LESSONS), 500);
  });
}