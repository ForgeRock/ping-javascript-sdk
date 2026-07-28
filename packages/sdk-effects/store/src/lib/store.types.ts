/*
 * Copyright (c) 2025 - 2026 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
import type { Middleware, Reducer, Store, ThunkDispatch, UnknownAction } from '@reduxjs/toolkit';

/**
 * Per-client slot on a store's thunk `extraArgument`.
 *
 * The fields are intentionally loose: `sdk-store` sits in the effects layer
 * alongside `sdk-request-middleware` and `sdk-logger`, so it cannot depend on
 * their types without crossing a module boundary. Each client narrows this to
 * its own concrete shape at the point of use.
 */
export interface ClientSlot {
  readonly requestMiddleware?: readonly unknown[];
  readonly logger?: unknown;
  /**
   * Identifies which client instance owns this slot, so a second client can be
   * detected before it silently shares the first one's cache slice.
   */
  readonly clientId?: string;
}

/**
 * The mutable client registry carried as the store's `extraArgument`.
 *
 * `configureStore` captures this object by reference, so slots added after the
 * store is built are visible to every subsequent request. That is what allows a
 * second client to attach itself to a store it did not create.
 */
export interface SdkStoreRegistry {
  readonly clients: Record<string, ClientSlot>;
}

/** A reducer that supports lazy slice injection, as produced by `combineSlices`. */
export interface InjectableRootReducer {
  inject: (slice: never) => unknown;
}

/** Middleware chain that accepts additions after the store is created. */
export interface DynamicMiddleware {
  addMiddleware: (...middleware: never[]) => unknown;
}

/**
 * A shared SDK Redux store, independent of the state shape.
 *
 * This is the single declaration of the contract between client packages, and
 * the type that travels between them: `davinci()` and `journey()` expose one,
 * `oidc()` accepts one. It is deliberately state-agnostic so a handle typed
 * with DaVinci's state is assignable to it without a cast — which is what lets
 * the whole path stay cast-free.
 *
 * An earlier design used a branded interface whose brand existed on no runtime
 * object. That forced `as unknown as` on both sides — four unchecked casts to
 * move one object across a package boundary, with no compile-time link between
 * producer and consumer. A structural type gives real checking instead.
 */
export interface SdkStore {
  readonly store: {
    getState: () => unknown;
    /** `never` parameter keeps any concrete dispatch assignable to this. */
    dispatch: (action: never) => unknown;
    subscribe: (listener: () => void) => () => void;
  };
  readonly rootReducer: InjectableRootReducer;
  readonly dynamicMiddleware: DynamicMiddleware;
  readonly extra: SdkStoreRegistry;
}

/**
 * A store handle with a known state shape.
 *
 * Returned by each client's own store factory so that internal code gets full
 * typing on `getState()` and `dispatch()`. Assignable to {@link SdkStore} for
 * hand-off to another client.
 */
export interface SdkStoreHandle<S extends object = Record<string, unknown>> extends SdkStore {
  /**
   * `dispatch` keeps RTK's thunk typing so clients can await the result of
   * `endpoint.initiate(...)` exactly as they would on a store they built
   * themselves.
   */
  readonly store: Store<S, UnknownAction> & {
    dispatch: ThunkDispatch<S, SdkStoreRegistry, UnknownAction>;
  };
  readonly rootReducer: InjectableRootReducer & Reducer<S>;
}

/** Options describing the client attaching itself to a store. */
export interface InjectClientOptions {
  /** The client's RTK Query api. Its reducer and middleware are both mounted. */
  readonly api: { reducerPath: string; reducer: Reducer; middleware: Middleware };
  /** Key for this client's slot on the registry. Normally `api.reducerPath`. */
  readonly reducerPath: string;
  /** Additional slices the client owns, e.g. its config and node slices. */
  readonly slices?: readonly { name: string; reducer: Reducer }[];
  readonly requestMiddleware?: readonly unknown[];
  readonly logger?: unknown;
  /** Recorded on the slot so repeat injections can be distinguished. */
  readonly clientId?: string;
}
