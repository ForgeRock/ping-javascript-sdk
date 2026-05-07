// Runs in the isolated world — relays postMessage events to the service worker
// via chrome.runtime, which is not available in the main world.
window.addEventListener('message', (e) => {
  if (e.source !== window || !(e.data as { __pingDevtools?: boolean })?.__pingDevtools) return;
  chrome.runtime.sendMessage({
    type: 'SDK_EVENT',
    payload: (e.data as { payload: unknown }).payload,
  });
});
