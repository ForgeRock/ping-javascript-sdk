import { default as FRAuth } from './fake/fr-auth';
import { CallbackType } from './fake/enums';
import { default as NameCallback } from './fake/name-callback';
import { Step, FailureDetail } from './fake/interfaces';
import { default as Config, ConfigOptions } from './fake/config';

export type { ConfigOptions, FailureDetail, Step };
export { CallbackType, Config, FRAuth, NameCallback };
