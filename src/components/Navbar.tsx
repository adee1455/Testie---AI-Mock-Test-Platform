import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const isIos = () => {
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

function isPWA() {
  return window.matchMedia('(display-mode: standalone)').matches
  || (window.navigator as any).standalone === true;
}

const Navbar: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = () => {
    if (isIos()) {
      navigate('/Install');
    } else if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    } else {
      alert('App can only be installed from supported browsers.');
    }
  };

  return (
    <nav className="w-full flex items-center justify-between px-4 py-3 bg-white/80 border-b border-gray-200 shadow-sm fixed top-0 left-0 z-50 backdrop-blur">
      <div className="flex items-center gap-3">
        <a href="/"><img src="/logo.png" alt="Testie Logo" className="w-10 h-10 rounded-full bg-black object-contain border border-gray-800" /></a>
        <a href="/"><span className="text-xl font-bold text-gray-900 tracking-tight">Testie</span></a>
      </div>
      <button
        onClick={handleInstall}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg font-medium shadow hover:bg-gray-800 transition"
      >
        Install App
      </button>
    </nav>
  );
};

export default Navbar; 