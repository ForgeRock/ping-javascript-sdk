/**
 * Verifies consumer-facing types are re-exported from @forgerock/journey-client/types.
 * Checked by tsc --noEmit, not executed at runtime.
 */
import type {
  // Already re-exported (regression guard)
  Step,
  Callback,
  CallbackType,
  StepType,
  GenericError,
  PolicyRequirement,
  FailedPolicyRequirement,
  LogLevel,
  CustomLogger,
  RequestMiddleware,
  ActionTypes,
  // These should be re-exported but are not yet
  NameValue,
  StepDetail,
  AuthResponse,
  FailureDetail,
} from '../types.js';

// PolicyKey is a value (enum), verify it is available from main index
import { PolicyKey } from '../index.js';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type _TypeAssert = [
  Step,
  Callback,
  CallbackType,
  StepType,
  GenericError,
  PolicyRequirement,
  FailedPolicyRequirement,
  LogLevel,
  CustomLogger,
  RequestMiddleware,
  ActionTypes,
  NameValue,
  StepDetail,
  AuthResponse,
  FailureDetail,
];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const _pk: typeof PolicyKey = PolicyKey;
