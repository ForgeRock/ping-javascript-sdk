/*
 * @forgerock/ping-javascript-sdk
 *
 * defaults.ts
 *
 * Copyright (c) 2020 - 2025 Ping Identity Corporation. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const browserProps = [
  'userAgent',
  'appName',
  'appCodeName',
  'appVersion',
  'appMinorVersion',
  'buildID',
  'product',
  'productSub',
  'vendor',
  'vendorSub',
  'browserLanguage',
];
export const configurableCategories = [
  'fontNames',
  'displayProps',
  'browserProps',
  'hardwareProps',
  'platformProps',
];
export const delay = 30 * 1000;
export const devicePlatforms = {
  mac: ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'],
  windows: ['Win32', 'Win64', 'Windows', 'WinCE'],
  ios: ['iPhone', 'iPad', 'iPod'],
};
export const displayProps = ['width', 'height', 'pixelDepth', 'orientation.angle'];
export const fontNames = [
  'cursive',
  'monospace',
  'serif',
  'sans-serif',
  'fantasy',
  'Arial',
  'Arial Black',
  'Arial Narrow',
  'Arial Rounded MT Bold',
  'Bookman Old Style',
  'Bradley Hand ITC',
  'Century',
  'Century Gothic',
  'Comic Sans MS',
  'Courier',
  'Courier New',
  'Georgia',
  'Gentium',
  'Impact',
  'King',
  'Lucida Console',
  'Lalit',
  'Modena',
  'Monotype Corsiva',
  'Papyrus',
  'Tahoma',
  'TeX',
  'Times',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
  'Verona',
];
export const hardwareProps = [
  'cpuClass',
  'deviceMemory',
  'hardwareConcurrency',
  'maxTouchPoints',
  'oscpu',
];
export const platformProps = ['language', 'platform', 'userLanguage', 'systemLanguage'];
