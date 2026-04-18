import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import './Landing.css';
import Navbar from './Components/Navbar/Navbar.tsx';
import Header from './Components/Header/Header.tsx';
import FeaturesCarousel from './Components/FeaturesCarousel/FeaturesCarousel.tsx';
import FAQ from './Components/FAQ/FAQ.tsx';

export default function Landing() {
  const landingRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = landingRef.current;
    if (!element) return;

    let rafId = 0;

    const updateDotsPosition = () => {
      const scrollTop = window.scrollY || window.pageYOffset;
      const viewportHeight = window.innerHeight || 1;
      const docHeight = document.documentElement.scrollHeight || 1;
      const faqElement = document.getElementById('faq');
      const dotsHeight = viewportHeight * 0.34;
      const start = viewportHeight * 0.08;
      const end = viewportHeight * 0.62;
      const baseMaxScroll = Math.max(docHeight - viewportHeight, 1);
      const faqTop = faqElement ? faqElement.getBoundingClientRect().top : Number.POSITIVE_INFINITY;
      const progress = Math.min(1, Math.max(0, scrollTop / baseMaxScroll));
      const top = start + (end - start) * progress;
      const boundaryTop = faqTop - dotsHeight;
      const finalTop = Math.min(top, boundaryTop);
      element.style.setProperty('--landing-dots-top', `${finalTop}px`);
    };

    const handleScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = 0;
        updateDotsPosition();
      });
    };

    updateDotsPosition();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', updateDotsPosition);

    return () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', updateDotsPosition);
    };
  }, []);

  return (
    <Box component="main" className="landing-page" ref={landingRef}>
      <Navbar />
      <Header />
      <FeaturesCarousel />
      <FAQ />
    </Box>
  );
}
