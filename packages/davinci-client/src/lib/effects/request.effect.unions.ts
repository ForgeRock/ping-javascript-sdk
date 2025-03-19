export const actionTypes = {
  start: 'DAVINCI_START',
  next: 'DAVINCI_NEXT',
  flow: 'DAVINCI_FLOW',
  success: 'DAVINCI_SUCCESS',
  error: 'DAVINCI_ERROR',
  failure: 'DAVINCI_FAILURE',
  resume: 'DAVINCI_RESUME',
} as const;

export type ActionTypes = (typeof actionTypes)[keyof typeof actionTypes];
export type EndpointTypes = keyof typeof actionTypes;
