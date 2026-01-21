import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.tsx';
import Footer from './components/landing/Footer.tsx';
import { applyTheme, getSystemTheme } from './theme/theme';
import LessonsMainPage from "./pages/Lessons/LessonsMainPage.tsx";
import LessonIdPage from "./pages/Lessons/LessonIdPage.tsx";

applyTheme(getSystemTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Lessons" element={<LessonsMainPage />} />
        <Route path='/Lessons/:lessonId' element={<LessonIdPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);
