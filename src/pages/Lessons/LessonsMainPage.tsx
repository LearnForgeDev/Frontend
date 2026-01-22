import type {lessonObject, viewLessonProps} from "../../types/lessonTypes.ts";
import {LessonItem} from "./Components/LessonItem.tsx";
import "../../styles/pages/Lessons/LessonsMainPage.css";
import {useNavigate} from "react-router-dom";

const mockLessons: lessonObject[] = [
  { id: 1, title: 'Урок 1: Введение в программирование' },
  { id: 2, title: 'Урок 2: Основы JavaScript' },
  { id: 3, title: 'Урок 3: Работа с DOM' },
]

export default function LessonsMainPage() {
  const navigate = useNavigate();

  const lessons = mockLessons; // TODO: Замените на реальный источник данных

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
        {
          lessons.length === 0
            ? ( <PlaceHolder /> )
            : (
              <>
                {lessons.map((lesson) => {
                  return (
                    <LessonItem
                      id={lesson.id}
                      title={lesson.title}
                      isEditable={true} //TODO: Замените на реальную логику проверки прав редактирования
                      handleEdit={(id, title) => viewLesson(true, id, title)}
                      handleClick={(id, title) => viewLesson(false, id, title)}
                      key={lesson.id}
                    />
                  );
                  })
                }
              </>
            )
        }
        <button className="create-lesson-button" aria-label="Создать новый урок">
          Создать урок
        </button>
      </main>
    </div>
  )
}

function PlaceHolder() {
  return <span className='placeholderText'>У Вас пока нет уроков. Добавим парочку?</span>;
}