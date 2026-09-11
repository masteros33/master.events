import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { Toaster } from 'react-hot-toast'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ErrorBoundary from './components/ErrorBoundary'
import TicketSuccessToast from './components/TicketSuccessToast'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { recoverFromStaleBuild, clearStaleBuildFlag } from './utils/staleBuild'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
    },
  },
});

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(reg => console.log("SW registered:", reg.scope))
      .catch(err => console.log("SW registration failed:", err));
  });

  // A worker that skipWaiting()s takes control of a page that already has the
  // previous build's HTML in it. The document keeps pointing at asset hashes
  // the new build no longer lists, so the next dynamic import 404s and the app
  // dies. Reload as soon as control changes — once per tab, so a worker that
  // keeps reclaiming can never put us in a refresh loop.
  let swapping = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (swapping) return;
    swapping = true;
    window.location.reload();
  });
}

// Vite raises this when a lazy chunk fails to load, which in practice means the
// build it belongs to has been replaced. Drop the caches and take the new one.
window.addEventListener("vite:preloadError", event => {
  event.preventDefault();
  recoverFromStaleBuild();
});

// The app got far enough to run. Whatever went wrong on a previous load is
// behind us, so re-arm recovery for the next deploy this tab lives through.
window.addEventListener("load", () => {
  window.setTimeout(clearStaleBuildFlag, 5000);
});

function Root() {
  return (<GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <App />
      <TicketSuccessToast />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '14px',
            fontSize: '14px',
            fontWeight: 600,
            fontFamily: 'var(--font-sans)',
            boxShadow: 'var(--shadow-md)',
            padding: '14px 18px',
          },
          success: { iconTheme: { primary: '#16a34a', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#dc2626', secondary: '#fff' } },
        }}
      />
    </GoogleOAuthProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <Root />
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>
)