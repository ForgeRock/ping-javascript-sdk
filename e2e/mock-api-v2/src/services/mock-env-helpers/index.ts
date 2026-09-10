/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import { Array, Effect, Option, pipe, Schema } from 'effect';

import { UnableToFindNextStep } from '../../errors/index.js';
import { ResponseMapKeys, responseMap } from '../../responses/index.js';
import { CapabilitiesResponse } from '../../schemas/capabilities/capabilities.response.schema.js';

import { QueryTypes } from '../../types/index.js';
import { validator } from '../../helpers/match.js';
import { HttpApiError } from 'effect/unstable/httpapi';

/**
 * Given data in the shape of Ping's Request formData.value
 * We will dive into the object by accessing `formData`
 * And then `value` off the object.
 *
 */
const mapDataToValue = (data: Option.Option<Schema.Schema.Type<typeof CapabilitiesResponse>>) =>
  pipe(
    data,
    Option.map((data) => data.formData),
    Option.map((data) => data.value),
  );

const getArrayFromResponseMap = (query: QueryTypes) =>
  Effect.succeed(responseMap[query?.acr_values as ResponseMapKeys]);
/**
 * A helper function that will use `acr_values` from query object
 * to grab the array from the `responseMap`.
 */
const getNextStep = (bool: boolean, query: QueryTypes) =>
  Effect.suspend(() =>
    bool ? getArrayFromResponseMap(query) : Effect.fail(new UnableToFindNextStep()),
  );

/**
 * Get the first element in the responseMap
 */
const getFirstElement = (arr: (typeof responseMap)[ResponseMapKeys]) =>
  Effect.succeed(pipe(Array.headNonEmpty(arr)));

/**
 * Gets the first element from the responseMap
 * And then creates a basic HttpResponse object that
 * will succeed
 *
 */
const getFirstElementAndRespond = (query: QueryTypes) =>
  Effect.gen(function* () {
    const acr = query?.acr_values;
    if (acr == null) return yield* Effect.fail(new HttpApiError.NotFound());
    const arr = responseMap[acr as ResponseMapKeys];
    if (!arr) return yield* Effect.fail(new HttpApiError.NotFound());
    return yield* getFirstElement(arr);
  });

/**
 * helper function that dives into a request body for Capabilities Response
 * and will apply a validator function to ensure the request passes validation
 */
const validateCapabilitiesResponse = (body: any) =>
  Effect.gen(function* () {
    if (body == null) return yield* Effect.fail(new HttpApiError.InternalServerError());
    const value = body?.parameters?.data?.formData?.value;
    if (value == null) return yield* Effect.fail(new HttpApiError.InternalServerError());
    return yield* validator(value);
  });

export {
  getNextStep,
  getFirstElementAndRespond,
  getArrayFromResponseMap,
  mapDataToValue,
  validateCapabilitiesResponse,
};
