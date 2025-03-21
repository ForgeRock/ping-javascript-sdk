/* eslint-disable @typescript-eslint/no-unused-vars */
import { describe, expectTypeOf, it } from 'vitest';
import type { InitFlow, InternalErrorResponse, Updater } from './client.types.js';
import type { GenericError } from './error.types.js';
import type { ErrorNode, FailureNode, ContinueNode, StartNode, SuccessNode } from './node.types.js';

describe('Client Types', () => {
  it('should allow function returning error', async () => {
    // This test isn't excellent but without narrowing inside the function we cant
    // narrow the promise type enough without some help on the generic
    const withError = async (): Promise<InternalErrorResponse> => {
      const result = await Promise.resolve<InternalErrorResponse>({
        error: { message: 'Test error', type: 'argument_error' as const },
        type: 'internal_error' as const,
      });
      return result;
    };

    expectTypeOf(withError()).resolves.toMatchTypeOf<InternalErrorResponse>();
  });
  it('should allow function returning node types', () => {
    const withErrorNode: InitFlow = async () => ({
      cache: {
        key: 'string',
      },
      client: {
        action: '',
        collectors: [],
        status: 'error',
      },
      error: {
        type: 'argument_error',
        status: 'failure',
        message: 'failed',
      },
      httpStatus: 400,
      server: {
        status: 'error',
      },
      status: 'error',
    });

    const withFailureNode: InitFlow = async () => ({
      cache: {
        key: '',
      },
      client: {
        status: 'failure',
      },
      error: {
        type: 'state_error',
        status: 'failure',
        message: 'failed',
      },
      httpStatus: 404,
      server: null,
      status: 'failure',
    });

    const withContinueNode: InitFlow = async () => ({
      cache: {
        key: 'cachekey',
      },
      client: {
        action: 'action',
        collectors: [],
        description: 'the description',
        name: 'continue_node_name',
        status: 'continue',
      },
      error: null,
      httpStatus: 200,
      server: {
        eventName: 'continue_event',
        status: 'continue',
      },
      status: 'continue',
    });

    const withStartNode: InitFlow = async () => ({
      cache: null,
      client: {
        status: 'start',
      },
      error: null,
      server: {
        status: 'start',
      },
      status: 'start',
    });

    const withSuccessNode: InitFlow = async () => ({
      cache: {
        key: 'key',
      },
      client: {
        authorization: {
          code: 'code123412',
          state: 'code123213',
        },
        status: 'success',
      },
      error: null,
      httpStatus: 200,
      server: {
        eventName: 'success_event',
        id: 'theid',
        interactionId: '213123',
        interactionToken: '123213',
        status: 'success',
      },
      status: 'success',
    });

    // Test return types
    // @ts-expect-error - This is a problem because ErrorResponse does not have a discriminator that separates it from FlowNode (see `error` key in both types.)
    expectTypeOf(withErrorNode).returns.resolves.toMatchTypeOf<ErrorNode>();
    // @ts-expect-error - This is a problem because ErrorResponse does not have a discriminator that separates it from FlowNode (see `error` key in both types.)
    expectTypeOf(withFailureNode).returns.resolves.toMatchTypeOf<FailureNode>();
    // @ts-expect-error - This is a problem because ErrorResponse does not have a discriminator that separates it from FlowNode (see `error` key in both types.)
    expectTypeOf(withContinueNode).returns.resolves.toMatchTypeOf<ContinueNode>();
    // @ts-expect-error - This is a problem because ErrorResponse does not have a discriminator that separates it from FlowNode (see `error` key in both types.)
    expectTypeOf(withStartNode).returns.resolves.toMatchTypeOf<StartNode>();
    // @ts-expect-error - This is a problem because ErrorResponse does not have a discriminator that separates it from FlowNode (see `error` key in both types.)
    expectTypeOf(withSuccessNode).returns.resolves.toMatchTypeOf<SuccessNode>();

    // Test that all are valid InitFlow types
    expectTypeOf(withErrorNode).toMatchTypeOf<InitFlow>();
    expectTypeOf(withFailureNode).toMatchTypeOf<InitFlow>();
    expectTypeOf(withContinueNode).toMatchTypeOf<InitFlow>();
    expectTypeOf(withStartNode).toMatchTypeOf<InitFlow>();
    expectTypeOf(withSuccessNode).toMatchTypeOf<InitFlow>();
  });

  it('should enforce async function return type', () => {
    // @ts-expect-error - Should not allow non-promise return
    const invalid: InitFlow = () => ({
      cache: {
        key: 'key',
      },
      client: {
        action: 'continue',
        collectors: [],
        status: 'continue',
      },
      error: null,
      httpStatus: 200,
      server: {
        status: 'continue',
      },
      status: 'continue',
    });

    expectTypeOf<InitFlow>().toBeFunction();

    // @ts-expect-error - Should not allow non-promise return - we expect this to error
    expectTypeOf<InitFlow>().returns.toEqualTypeOf<InitFlow>();
  });
});

describe('Updater', () => {
  it('should accept string value and optional index', () => {
    const updater: Updater = (value: string | string[] | boolean, index?: number) => {
      return {
        error: { message: 'Invalid value', code: 'INVALID', type: 'state_error' },
        type: 'internal_error',
      };
    };
    expectTypeOf(updater).parameter(0).toEqualTypeOf<string | string[]>();
    expectTypeOf(updater).parameter(1).toBeNullable();
    expectTypeOf(updater).parameter(1).toBeNullable();
  });

  it('should return error or null', () => {
    const withError: Updater = () => ({
      error: { message: 'Invalid value', code: 'INVALID', type: 'state_error' },
      type: 'internal_error',
    });

    const withoutError: Updater = () => null;

    expectTypeOf(withError).returns.toMatchTypeOf<{ error: GenericError } | null>();
    expectTypeOf(withoutError).returns.toMatchTypeOf<{ error: GenericError } | null>();

    // Test both are valid Updater types
    expectTypeOf(withError).toMatchTypeOf<Updater>();
    expectTypeOf(withoutError).toMatchTypeOf<Updater>();
  });
});
