declare global {
  interface Window {
    __PING_DEVTOOLS_EXTENSION__?: boolean;
  }
}

window.__PING_DEVTOOLS_EXTENSION__ = true;

window.addEventListener('pingDevtools', (raw: Event) => {
  const event = raw as CustomEvent;
  window.postMessage({ __pingDevtools: true, payload: event.detail }, '*');
});
