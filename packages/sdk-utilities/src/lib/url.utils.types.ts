/**
 *
 * Copyright © 2025 Ping Identity Corporation. All right reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 *
 **/

export type ConfigurablePaths = keyof CustomPathConfig;

/**
 * Optional configuration for custom paths for actions
 */
export interface CustomPathConfig {
  authenticate?: string;
  authorize?: string;
  accessToken?: string;
  endSession?: string;
  userInfo?: string;
  revoke?: string;
  sessions?: string;
}

/** ****************************************************************
 * @param {ConfigurablePaths} endpoint - The endpoint to get the path for
 * @param {string} realmPath - The realm path
 * @param {CustomPathConfig} customPaths - The custom paths
 */
export interface GetEndpointPathParams {
  endpoint: ConfigurablePaths;
  realmPath?: string;
  customPaths?: CustomPathConfig;
}
