import {default as Config } from './fake/config';
import { CallbackType } from './fake/enums';
import { default as FRAuth } from './fake/fr-auth';
import { default as NameCallback } from './fake/name-callback';

import type { ConfigOptions} from './fake/config';
import type { FailureDetail,Step } from './fake/interfaces';

export type { ConfigOptions, FailureDetail, Step };
export { CallbackType, Config, FRAuth, NameCallback };
