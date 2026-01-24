import type {viewLessonProps, lessonCompactObject} from "../../types/lessonTypes.ts";
import {LessonItem} from "./Components/LessonItem.tsx";
import "../../styles/pages/Lessons/LessonsMainPage.css";
import {useNavigate} from "react-router-dom";
import {getCompactLessons} from "../../server/Lessons.ts";
import {useEffect, useState, type CSSProperties} from "react";

export default function LessonsMainPage() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<lessonCompactObject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCompactLessons()
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
    <div className='lessons-main-page' data-loading={loading}>
      <header>
        <h1>Мои уроки</h1>
      </header>
      <main>
        <div className="lessons-body">
          <div className="lessons-loader" aria-hidden={!loading}>
            <LessonsSkeletonLoader />
          </div>
          <div className="lessons-content" aria-busy={loading}>
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
          </div>
        </div>
        <button className="create-lesson-button" aria-label="Создать новый урок">
          Создать урок
        </button>
      </main>
    </div>
  );
}

function LessonsSkeletonLoader() {
  return (
    <div className="lesson-skeleton-list" aria-hidden="true">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="lesson-item lesson-item-skeleton"
          style={{ '--skeleton-delay': `${i * 0.12}s` } as CSSProperties}
        >
          <div className="lesson-item-skeleton__icon skeleton-animation" />
          <div
            className="lesson-item-skeleton__title skeleton-animation"
            style={{ width: `${78 - i * 8}%` }}
          />
          <div className="lesson-item-skeleton__controls">
            <div className="lesson-item-skeleton__button skeleton-animation" />
            <div className="lesson-item-skeleton__button skeleton-animation" />
          </div>
        </div>
      ))}
    </div>
  );
}


function PlaceHolder() {
  return <span className='placeholderText'>У Вас пока нет уроков. Добавим парочку?</span>;
}
