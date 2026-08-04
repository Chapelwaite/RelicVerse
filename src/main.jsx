import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import './styles/theme.css';
import './styles/animations.css';
import './styles/global.css';
import './styles/pages.css';
import './styles/universes.css';
import './styles/admin.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
