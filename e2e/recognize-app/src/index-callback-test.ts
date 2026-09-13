import {
  callbackType,
  journey,
  NameCallback,
  PasswordCallback,
  PingOneRecognizeCallback,
} from '@forgerock/journey-client';
import { recognize } from '@forgerock/recognize';
import './styles.css';

const appEl = document.getElementById('app') as HTMLDivElement;
appEl.style.cssText = 'display:flex;gap:1.5rem;align-items:flex-start;';

const leftEl = document.createElement('div');
leftEl.style.cssText = 'flex:0 0 400px;min-width:400px;';
appEl.appendChild(leftEl);

const rightEl = document.createElement('div');
rightEl.style.cssText = 'flex:1;height:calc(100vh - 4rem);overflow-y:auto;';
appEl.appendChild(rightEl);

console.log('[build] recognize-app loaded');

function promptConfig(): Promise<{ wellknown: string; journeyName: string }> {
  return new Promise((resolve) => {
    const form = document.createElement('form');
    form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;';
    form.innerHTML = `
      <label style="display:flex;flex-direction:column;gap:2px;font-size:0.85rem;">Well-known URL <input id="wellknown" type="text" style="width:100%;box-sizing:border-box;" /></label>
      <label style="display:flex;flex-direction:column;gap:2px;font-size:0.85rem;">Journey name <input id="journeyName" type="text" /></label>
      <button type="submit">Connect</button>
    `;
    leftEl.appendChild(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const wellknown = (form.querySelector('#wellknown') as HTMLInputElement).value.trim();
      const journeyName = (form.querySelector('#journeyName') as HTMLInputElement).value.trim();
      form.remove();
      resolve({ wellknown, journeyName });
    });
  });
}

function log(msg: string) {
  console.log(msg);
  const p = document.createElement('p');
  p.style.cssText = 'font-family:monospace;font-size:0.85rem;margin:2px 0;';
  if (msg.startsWith('[error]')) p.style.color = 'crimson';
  else if (msg.startsWith('[done]')) p.style.color = 'green';
  else if (msg.startsWith('[recognize]')) p.style.color = '#2563eb';
  else if (msg.startsWith('[step]')) p.style.color = '#7c3aed';
  p.textContent = msg;
  rightEl.appendChild(p);
}

function promptCredentials(): Promise<{ username: string; password: string }> {
  return new Promise((resolve) => {
    const form = document.createElement('form');
    form.style.cssText = 'display:flex;flex-direction:column;gap:0.5rem;';
    form.innerHTML = `
      <label style="display:flex;flex-direction:column;gap:2px;font-size:0.85rem;">Username <input id="username" type="text" autocomplete="username" /></label>
      <label style="display:flex;flex-direction:column;gap:2px;font-size:0.85rem;">Password <input id="password" type="password" autocomplete="current-password" /></label>
      <button type="submit">Submit</button>
    `;
    leftEl.appendChild(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = (form.querySelector('#username') as HTMLInputElement).value;
      const password = (form.querySelector('#password') as HTMLInputElement).value;
      form.remove();
      resolve({ username, password });
    });
  });
}

(async () => {
  const { wellknown, journeyName } = await promptConfig();
  log('[init] starting journey client...');
  let journeyClient;
  try {
    journeyClient = await journey({ config: { serverConfig: { wellknown } } });
  } catch (err) {
    log(`[error] failed to init journey client: ${err}`);
    return;
  }

  log('[init] starting journey...');
  let step;
  try {
    step = await journeyClient.start({ journey: journeyName });
  } catch (err) {
    log(`[error] failed to start journey: ${err}`);
    return;
  }

  while (step.type === 'Step') {
    const recognizeCallback = step.callbacks.find(
      (cb) => cb.getType() === callbackType.PingOneRecognizeCallback,
    ) as PingOneRecognizeCallback | undefined;

    if (recognizeCallback) {
      log(`[step] got PingOneRecognizeCallback — op: ${recognizeCallback.getOperationType()}`);
      log(`[config] ${JSON.stringify(recognizeCallback.getWebSDKConfig())}`);

      const config = recognizeCallback.getWebSDKConfig();
      const operationType = recognizeCallback.getOperationType();

      const serviceURL = config.ws.url
        .replace(/^wss:\/\//, 'https://')
        .replace(/^ws:\/\//, 'http://');

      log(`[options] webSDKOptions from server: ${JSON.stringify(recognizeCallback.getOptions())}`);

      const client = recognize({
        customer: recognizeCallback.getCustomerName(),
        serviceURL,
        ...(recognizeCallback.getTransactionData()
          ? { transactionData: recognizeCallback.getTransactionData() }
          : {}),
        ...(recognizeCallback.getOptions() as Record<string, unknown>),
      });

      await new Promise<void>((resolve, reject) => {
        client.subscribe({
          next: (event) => {
            log(
              `[recognize] ${event.type}${'detail' in event ? ': ' + JSON.stringify(event.detail) : ''}`,
            );
          },
          error: (err) => {
            console.error(
              '[recognize] raw error:',
              err,
              'constructor:',
              err?.constructor?.name,
              'instanceof RecognizeError:',
              err instanceof Error,
            );
            log(
              `[recognize] error: ${JSON.stringify(err)} — code:${err.error.code} — msg:${err.error.message} — constructor:${err?.constructor?.name}`,
            );
            recognizeCallback.setClientError(err.error.message);
            recognizeCallback.setClientErrorCode(String(err.error.code));
            resolve();
          },
          complete: (data) => {
            log(`[recognize] complete — data: ${JSON.stringify(data)}`);
            if (data.jwt) {
              recognizeCallback.setSignedJwt(data.jwt);
              try {
                const payload = JSON.parse(atob(data.jwt.split('.')[1]));
                if (payload.sub) {
                  log(`[recognize] recognizeId from JWT sub: ${payload.sub}`);
                  recognizeCallback.setRecognizeId(payload.sub);
                }
              } catch (e) {
                log(`[recognize] could not parse JWT sub: ${e}`);
              }
            }
            resolve();
          },
        });

        const container = document.createElement('div');
        leftEl.appendChild(container);

        client
          .init({
            mode: 'mount',
            container,
            type: operationType === 'ENROLL' ? 'enroll' : 'auth',
            username: recognizeCallback.getUsername(),
          })
          .then((err) => {
            if (err) {
              log(`[recognize] init error: ${err}`);
              reject(err);
            }
          })
          .catch((err) => {
            log(`[recognize] init threw: ${err}`);
            console.error('[recognize] init threw:', err);
            reject(err);
          });
      });

      client.dispose();
    } else {
      const hasName = step.callbacks.some((cb) => cb.getType() === callbackType.NameCallback);
      const hasPassword = step.callbacks.some(
        (cb) => cb.getType() === callbackType.PasswordCallback,
      );

      if (hasName || hasPassword) {
        log('[step] credentials required');
        const { username, password } = await promptCredentials();

        if (hasName) {
          const cb = step.callbacks.find(
            (cb) => cb.getType() === callbackType.NameCallback,
          ) as NameCallback;
          cb.setName(username);
        }
        if (hasPassword) {
          const cb = step.callbacks.find(
            (cb) => cb.getType() === callbackType.PasswordCallback,
          ) as PasswordCallback;
          cb.setPassword(password);
        }
      } else {
        const types = step.callbacks.map((cb) => cb.getType()).join(', ');
        log(`[step] unhandled callbacks: [${types}]`);
        break;
      }
    }

    step = await journeyClient.next(step);
  }

  if (step.type === 'LoginSuccess') {
    log(`[done] Login successful — session: ${step.getSessionToken() ?? 'none'}`);
  } else if (step.type === 'LoginFailure') {
    log(`[done] Login failed — ${step.payload.message}`);
  }
})();
