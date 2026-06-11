import './styles.css';
import { recognize } from '@forgerock/recognize';

const client = recognize({
  customer: 'CUSTOMER_NAME',
  key: 'IMAGE_ENCRYPTION_PUBLIC_KEY',
  keyID: 'IMAGE_ENCRYPTION_KEY_ID',
  wsURL: 'KEYLESS_AUTHENTICATION_SERVICE_URL',
  transactionData: 'DATA_FROM_CUSTOMER_SERVER_TO_BE_SIGNED',
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
    .init({ mode: 'mount', container: appEl, type: 'auth', username: 'USERNAME' })
    .then((err) => {
      if (err) console.error('[recognize] init error', err);
    });
}
