// Fix mobile 100vh issues (address bar, fullscreen PWA, Android WebView)
// Sets a CSS variable --vh equal to 1% of the viewport height and updates on resize/orientationchange

function setVh() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Run on load
setVh();

// Update on resize and orientation changes
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);

// For some WebViews the initial innerHeight might be wrong until a short delay
setTimeout(setVh, 500);

// Try to set native status bar color to black when running inside Capacitor
(() => {
  try {
    const Cap: any = (window as any).Capacitor || {};
    const plugins = Cap.Plugins || (Cap as any).plugin || {};
    const StatusBar = plugins.StatusBar;
    if (StatusBar && typeof StatusBar.setBackgroundColor === 'function') {
      // plugin available via global Capacitor bridge
      StatusBar.setBackgroundColor({ color: '#000000' }).catch(() => {});
    }
  } catch (e) {
    // ignore; not running in Capacitor environment or plugin not present
  }
})();

// Export nothing; file only for side effects
export {};
