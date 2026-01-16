import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing.tsx';
import Lessons from './pages/Lessons.tsx';
import Footer from './components/landing/Footer.tsx';
import { applyTheme, getSystemTheme } from './theme/theme';

applyTheme(getSystemTheme());

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/Lessons" element={<Lessons />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  </StrictMode>,
);
