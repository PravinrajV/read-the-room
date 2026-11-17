import './index.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initTheme } from './theme';
import { RoomApp } from './components/RoomApp';

initTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RoomApp />
  </StrictMode>
);
