import { recognize } from '@forgerock/recognize';
import './styles.css';

const client = recognize({
  authorizationToken: 'USER_AUTHORIZATION_FROM_CUSTOMER',
  customer: 'CUSTOMER_NAME',
  serviceURL: 'KEYLESS_SERVICE_URL',
  transactionData: 'DATA_FROM_CUSTOMER_SERVER_TO_BE_SIGNED',
});

client.subscribe({
  next: ({ type, ...rest }) => {
    console.log('[recognize]', type, rest);
  },
  error: (err) => {
    console.error('[recognize] error', {
      code: err.error.code,
      message: err.error.message,
      cause: err.error.cause,
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
