export const TOKEN_ERRORS = {
  CLIENT_ID_REQUIRED: 'Client ID is required.',
  INVALID_STORE: 'Invalid token store type. Expected "local storage" or "sessionStorage".',
  STORAGE_REQUIRED:
    'Local storage or session storage is required when not passing in a custom store',
  PARSE_LOCAL_STORAGE: 'Could not parse token from local storage',
  PARSE_SESSION_STORAGE: 'Could not parse token from session storage',
  NO_TOKENS_FOUND_SESSION_STORAGE: `No tokens found in session storage`,
  NO_TOKENS_FOUND_LOCAL_STORAGE: `No tokens found in local storage`,
} as const;

export type TOKEN_ERRORS = (typeof TOKEN_ERRORS)[keyof typeof TOKEN_ERRORS];
