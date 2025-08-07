/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Schema } from 'effect';
import { DavinciAuthorizeHeaders, DavinciAuthorizeQuery } from '../schemas/authorize.schema.js';
import { SuccessResponseRedirect } from '../schemas/return-success-response-redirect.schema.js';

type QueryTypes = Schema.Schema.Type<typeof DavinciAuthorizeQuery> | null;

type HeaderTypes = Schema.Schema.Type<typeof DavinciAuthorizeHeaders> | null;

type CustomHtmlResponseBody = Schema.Schema.Type<typeof SuccessResponseRedirect>;

export { CustomHtmlResponseBody, QueryTypes, HeaderTypes };
