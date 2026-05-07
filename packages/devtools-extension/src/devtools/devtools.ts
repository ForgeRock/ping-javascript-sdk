// Runs in the devtools page context — has access to chrome.devtools.*

let port: chrome.runtime.Port | null = null;

function connect() {
  try {
    // chrome.runtime.id throws (not just returns undefined) when the extension
    // context is invalidated — so we must catch, not just optional-chain.
    if (!chrome.runtime.id) return;
    port = chrome.runtime.connect({ name: 'devtools' });
    port.onDisconnect.addListener(() => {
      port = null;
      setTimeout(connect, 1000);
    });
  } catch {
    // Context invalidated — stop reconnecting silently.
  }
}

connect();

// panels.create is safe to call once — the devtools page is not reloaded
// while DevTools is open, so no need to guard with runtime.id here.
chrome.devtools.panels.create('Ping DevTools', '', 'panel/panel.html', undefined);

chrome.devtools.network.onRequestFinished.addListener((entry) => {
  port?.postMessage({
    type: 'NETWORK_EVENT',
    payload: {
      request: entry.request,
      response: entry.response,
      time: entry.time,
    },
  });
});
