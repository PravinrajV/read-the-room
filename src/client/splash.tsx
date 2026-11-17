import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { SplashApp } from './components/SplashApp';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SplashApp />
  </StrictMode>
);
