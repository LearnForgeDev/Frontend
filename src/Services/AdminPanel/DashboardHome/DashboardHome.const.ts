import { keyframes } from '@mui/material/styles';

export const gradientFadeIn = keyframes`
  0% { opacity: 0; filter: blur(80px); transform: scale(1.1); }
  100% { opacity: 1; filter: blur(60px); transform: scale(1); }
`;

export const gradientPulse = keyframes`
  0%, 100% { filter: blur(60px); opacity: 1; transform: scale(1) translate(0, 0); }
  50% { filter: blur(70px); opacity: 0.85; transform: scale(1.02) translate(-10px, -10px); }
`;

export const textSlideUp = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

export const widgetFadeIn = keyframes`
  0% { opacity: 0; transform: translateY(30px); }
  100% { opacity: 1; transform: translateY(0); }
`;
