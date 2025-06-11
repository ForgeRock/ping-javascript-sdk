import { deviceClient } from '@forgerock/device-client';
import { Config } from '@forgerock/javascript-sdk';
import { Context, Effect, Layer } from 'effect';

const url = new URL(window.location.href);
const amUrl = url.searchParams.get('amUrl') || 'https://openam-sdks.forgeblocks.com/am';
const realmPath = url.searchParams.get('realmPath') || 'alpha';
const platformHeader = url.searchParams.get('platformHeader') === 'true' ? true : false;
const tree = url.searchParams.get('tree') || 'selfservice';

export class DeviceClient extends Context.Tag('DeviceClient')<
  DeviceClient,
  ReturnType<typeof deviceClient>
>() {}

const config = {
  realmPath,
  tree,
  clientId: 'WebOAuthClient',
  scope: 'profile email me.read openid',
  serverConfig: {
    baseUrl: amUrl,
    timeout: 3000,
  },
};

export const DeviceClientLive = Layer.succeed(
  DeviceClient,
  DeviceClient.of({
    ...deviceClient(config),
  }),
);

export class SDKConfig extends Context.Tag('SDKConfig')<SDKConfig, void>() {}

export const SDKConfigLive = Layer.scoped(
  SDKConfig,
  Effect.gen(function* () {
    yield* Effect.try(() =>
      Config.set({
        platformHeader,
        realmPath,
        tree,
        clientId: 'WebOAuthClient',
        scope: 'profile email me.read openid',
        redirectUri: `${window.location.origin}/src/_callback/index.html`,
        serverConfig: {
          baseUrl: amUrl,
          timeout: 3000,
        },
      }),
    );
  }),
);
