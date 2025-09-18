/*
 * @forgerock/javascript-sdk
 *
 * index.test.ts
 *
 * Copyright (c) 2024 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

import JourneyStep from '../journey-step.js';
import JourneyQRCode from './journey-qrcode.js';
import { otpQRCodeStep, pushQRCodeStep } from '../journey-qrcode/journey-qr-code.mock.data.js';
// import WebAuthn step as it's similar in structure for testing non-QR Code steps
import { webAuthnRegJSCallback70 } from '../journey-webauthn/journey-webauthn.mock.data.js';

describe('Class for managing QR Codes', () => {
  it('should return true for step containing OTP QR Code callbacks', () => {
    const expected = true;
    const step = new JourneyStep(otpQRCodeStep);
    const result = JourneyQRCode.isQRCodeStep(step);

    expect(result).toBe(expected);
  });

  it('should return true for step containing Push QR Code callbacks', () => {
    const expected = true;
    const step = new JourneyStep(pushQRCodeStep);
    const result = JourneyQRCode.isQRCodeStep(step);

    expect(result).toBe(expected);
  });

  it('should return false for step containing WebAuthn step', () => {
    const expected = false;
    const step = new JourneyStep(webAuthnRegJSCallback70);
    const result = JourneyQRCode.isQRCodeStep(step);

    expect(result).toBe(expected);
  });

  it('should return an object with OTP QR Code data', () => {
    const expected = {
      message:
        'Scan the QR code image below with the ForgeRock Authenticator app to register your ' +
        'device with your login.',
      use: 'otp',
      uri:
        'otpauth://totp/ForgeRock:jlowery?secret=QITSTC234FRIU8DD987DW3VPICFY======&issue' +
        'r=ForgeRock&period=30&digits=6&b=032b75',
    };
    const step = new JourneyStep(otpQRCodeStep);
    const result = JourneyQRCode.getQRCodeData(step);

    expect(result).toStrictEqual(expected);
  });

  it('should return an object with Push QR Code data', () => {
    const expected = {
      message:
        'Scan the QR code image below with the ForgeRock Authenticator app to register ' +
        'your device with your login.',
      use: 'push',
      uri:
        'pushauth://push/forgerock:Justin%20Lowery?l=YW1sYmNvb2tpZT0wMQ&issuer=Rm9yZ2VSb' +
        '2Nr&m=REGISTER:53b85112-8ba9-4b7e-9107-ecbca2d65f7b1695151603616&s=FoxEr5uAzrys' +
        '1yBmuygPbxrVjysElmzsmqifi6eO_AI&c=XD-MxsK2sRGa7sUw7kinSKoUDf_eNYMZUV2f0z5kjgw&r' +
        '=aHR0cHM6Ly9vcGVuYW0tZm9yZ2Vycm9jay1zZGtzLmZvcmdlYmxvY2tzLmNvbTo0NDMvYW0vanNvbi' +
        '9hbHBoYS9wdXNoL3Nucy9tZXNzYWdlP19hY3Rpb249cmVnaXN0ZXI&a=aHR0cHM6Ly9vcGVuYW0tZm9' +
        'yZ2Vycm9jay1zZGtzLmZvcmdlYmxvY2tzLmNvbTo0NDMvYW0vanNvbi9hbHBoYS9wdXNoL3Nucy9tZ' +
        'XNzYWdlP19hY3Rpb249YXV0aGVudGljYXRl&b=032b75',
    };
    const step = new JourneyStep(pushQRCodeStep);
    const result = JourneyQRCode.getQRCodeData(step);

    expect(result).toStrictEqual(expected);
  });
});
