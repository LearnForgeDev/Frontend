import type {viewLessonProps, lessonCompactObject} from "../../types/lessonTypes.ts";
import {LessonItem} from "./Components/LessonItem.tsx";
import './LessonsMainPage.css';
import {useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";

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
    <div className='lessons-main-page'>
      <header>
        <h1>Мои уроки</h1>
      </header>
      <main>
        {loading && <LessonsSkeletonLoader />}
        {!loading && error && (
          <span className='placeholderText'>Не удалось загрузить уроки: {error}</span>
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
        <button className="create-lesson-button" aria-label="Создать новый урок">
          Создать урок
        </button>
      </main>
    </div>
  );
}

function LessonsSkeletonLoader() {
  return (
    <>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="lesson-item skeleton-animation" style={{width: '2rem'}}></div>
      ))}
    </>
  );
}

function PlaceHolder() {
  return <span className='placeholderText'>У Вас пока нет уроков. Добавим парочку?</span>;
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