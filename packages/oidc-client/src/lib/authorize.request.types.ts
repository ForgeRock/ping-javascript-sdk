export interface AuthorizeSuccessResponse {
  code: string;
  state: string;
  redirectUrl?: string; // Optional, used when the response is from a P1 server
}

export interface AuthorizeErrorResponse {
  error: string;
  error_description: string;
  redirectUrl: string; // URL to redirect the user to for re-authorization
  type: 'auth_error';
}
