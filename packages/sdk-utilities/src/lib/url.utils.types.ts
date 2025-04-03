/**
 *
 * Copyright © 2025 Ping Identity Corporation
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
