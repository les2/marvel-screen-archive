export const PWA_UPDATE_EVENT = 'marvel-app-update-ready';
export const PWA_UPDATE_CHECK_INTERVAL_MS = 60 * 60 * 1000;

export function controllerChangeState(hadController:boolean): {hadController:true;announce:boolean} {
  return { hadController:true, announce:hadController };
}

export function startPwaUpdateChecks(): void {
  if (!('serviceWorker' in navigator) || location.hostname === '127.0.0.1' || location.hostname === 'localhost') return;

  let hadController = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    const state = controllerChangeState(hadController);
    hadController = state.hadController;
    if (state.announce) window.dispatchEvent(new Event(PWA_UPDATE_EVENT));
  });

  navigator.serviceWorker.register('/sw.js',{updateViaCache:'none'}).then((registration) => {
    const check = () => { void registration.update().catch(() => undefined); };
    check();
    window.setInterval(check,PWA_UPDATE_CHECK_INTERVAL_MS);
    document.addEventListener('visibilitychange',() => { if (document.visibilityState === 'visible') check(); });
  }).catch(() => undefined);
}
