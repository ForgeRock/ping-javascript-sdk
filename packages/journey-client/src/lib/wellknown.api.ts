/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

/**
 * Re-export the shared wellknown RTK Query API from @forgerock/sdk-oidc.
 *
 * The wellknown API provides OIDC endpoint discovery functionality via
 * the `.well-known/openid-configuration` endpoint.
 */
export { wellknownApi, createWellknownSelector } from '@forgerock/sdk-oidc';
