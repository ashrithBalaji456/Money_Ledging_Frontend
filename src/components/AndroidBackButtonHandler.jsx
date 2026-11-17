import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';

const AndroidBackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showExitToast, setShowExitToast] = useState(false);
  const lastBackPressRef = useRef(0);
  const toastTimeoutRef = useRef(null);

  const locationRef = useRef(location);
  const navigateRef = useRef(navigate);

  useEffect(() => {
    locationRef.current = location;
    navigateRef.current = navigate;
  }, [location, navigate]);

  useEffect(() => {
    // Only register back button listener on native platforms (Android / iOS)
    if (!Capacitor.isNativePlatform()) return;

    let listenerHandle = null;

    const setupListener = async () => {
      listenerHandle = await CapApp.addListener('backButton', () => {
        const currentPath = locationRef.current.pathname;

        // 1. Check if any modal/drawer is open and can be closed first
        if (typeof window.__closeActiveModal === 'function') {
          const handled = window.__closeActiveModal();
          if (handled) return;
        }

        // 2. If not on the root or login screen, navigate to previous screen
        const isRootPage = currentPath === '/' || currentPath === '/login';
        if (!isRootPage) {
          navigateRef.current(-1);
          return;
        }

        // 3. If on root page, double-press back to exit app
        const now = Date.now();
        if (now - lastBackPressRef.current < 2000) {
          CapApp.exitApp();
        } else {
          lastBackPressRef.current = now;
          setShowExitToast(true);
          clearTimeout(toastTimeoutRef.current);
          toastTimeoutRef.current = setTimeout(() => {
            setShowExitToast(false);
          }, 2000);
        }
      });
    };

    setupListener();

    return () => {
      if (listenerHandle && listenerHandle.remove) {
        listenerHandle.remove();
      }
      clearTimeout(toastTimeoutRef.current);
    };
  }, []);

  if (!showExitToast) return null;

  return (
    <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-slide-up">
      <div className="bg-slate-900/95 text-slate-200 border border-white/10 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl backdrop-blur-md flex items-center gap-2">
        <span>Press back again to exit</span>
      </div>
    </div>
  );
};

export default AndroidBackButtonHandler;
