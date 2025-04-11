export interface Tokens {
  accessToken: string;
  idToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
}

export interface TokensError {
  error: (typeof TOKEN_ERRORS)[keyof typeof TOKEN_ERRORS];
}
export const TOKEN_ERRORS = {
  CLIENT_ID_REQUIRED: 'Client ID is required.',
  INVALID_STORE: 'Invalid token store type. Expected "localStorage" or "sessionStorage".',
  SYNC_MODE_ERROR: 'Sync mode requires localStorage/sessionStorage.',
} as const;

export type TokenStoreObject = {
  get: (key: string) => Promise<Tokens | TokensError>;
  set: (key: string, value: Tokens) => Promise<void | TokensError>;
  remove: (key: string) => Promise<void | TokensError>;
};
