import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initTheme } from './theme';
import { SplashApp } from './components/SplashApp';

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SplashApp />
  </StrictMode>
);
