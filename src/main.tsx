import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing/Landing.tsx';
import Footer from './pages/Landing/Components/Footer.tsx';
import { applyTheme, getSystemTheme } from './styles/theme.tsx';
import LessonsMainPage from "./pages/Lessons/LessonsMainPage.tsx";
import LessonIdPage from "./pages/Lessons/LessonIdPage.tsx";

applyTheme(getSystemTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename='/Frontend/'>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Lessons" element={<LessonsMainPage />} />
        <Route path='/Lessons/:lessonId' element={<LessonIdPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);
