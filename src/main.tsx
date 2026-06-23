import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';

if (import.meta.env?.DEV) {
  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason;
    const message =
      reason instanceof Error
        ? `${reason.name}: ${reason.message}\n${reason.stack || ''}`
        : typeof reason === 'object'
          ? JSON.stringify(reason, null, 2)
          : String(reason);
    console.error('[unhandledrejection]', message);
    event.preventDefault();
  });
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
