// /*
//  *
//  * Copyright © 2025 Ping Identity Corporation. All right reserved.
//  *
//  * This software may be modified and distributed under the terms
//  * of the MIT license. See the LICENSE file for details.
//  *
//  */

// import { UserManager } from '@forgerock/javascript-sdk';
// import { autoscript, handleError } from '../autoscript.js';
// import { DeviceClient } from '../types.js';
// import { Effect } from 'effect';

// /**
//  * @function handlePush
//  * @description Handles PUSH device management operations such as getting and deleting devices
//  * @param {DeviceClient} client A device client instance from the JS SDK
//  * @returns {Effect.Effect<void, Error, never>} An Effect that performs PUSH device management operations
//  */
// function handlePush(client: DeviceClient): Effect.Effect<void, Error, never> {
//   return Effect.gen(function* () {
//     const user = yield* Effect.tryPromise({
//       try: () => UserManager.getCurrentUser(),
//       catch: (err) => new Error(`Failed to get current user: ${err}`),
//     });

//     const query = {
//       userId: (user as Record<string, string>).sub,
//       realm: 'alpha',
//     };

//     const deviceArr = yield* Effect.promise(() => client.push.get(query));
//     console.log('GET devices', deviceArr);

//     if (Array.isArray(deviceArr)) {
//       const [device] = deviceArr;

//       if (!device) {
//         yield* Effect.fail(new Error('No device to delete'));
//       }
//       console.log('device', device);

//       const deletedDevice = yield* Effect.promise(() =>
//         client.push.delete({
//           ...query,
//           device,
//         }),
//       );

//       if (deletedDevice !== null && deletedDevice.error) {
//         yield* Effect.fail(new Error(`Failed to delete device: ${deletedDevice.error}`));
//       }

//       console.log('deleted', deletedDevice);
//     } else {
//       yield* Effect.fail(new Error(`Failed to get devices: ${deviceArr.error}`));
//     }
//   });
// }

// // Execute the device test
// Effect.runPromise(autoscript(handlePush)).then(console.log, handleError);
