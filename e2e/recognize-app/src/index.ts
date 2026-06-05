import './styles.css';
import { recognize } from '@forgerock/recognize';

const client = recognize({
  customer: 'your-customer-id',
  key: 'your-public-key',
  keyID: 'your-key-id',
  wsURL: 'wss://your-websocket-url',
  transactionData: 'your-transaction-data',
});

client.subscribe({
  next: (event) => {
    console.log('[recognize]', event.type, event.detail);
  },
  error: (err) => {
    console.error('[recognize] error', {
      code: err.code,
      message: err.message,
      name: err.name,
      cause: err.cause,
    });
  },
  complete: (detail) => {
    console.log('[recognize] complete', detail);
  },
});

const appEl = document.getElementById('app');
if (appEl) {
  client
    .init({ mode: 'mount', container: appEl, type: 'auth', username: 'eugenio' })
    .then((err) => {
      if (err) console.error('[recognize] init error', err);
    });
}
