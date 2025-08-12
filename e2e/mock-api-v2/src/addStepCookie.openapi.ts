/*
 * Copyright (c) 2025 Ping Identity Corporation. All rights reserved.
 *
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export const addStepCookie = (spec: any) => {
  const FLOW_TAGS = new Set(['Authorization', 'Capabilities']);
  const FLOW_PATH_MATCHERS = [
    /\/davinci\/authorize\b/,
    /\/davinci\/connections\/[^/]+\/capabilities\//,
  ];

  const shouldAnnotate = (path: string, op: any) =>
    (Array.isArray(op?.tags) && op.tags.some((t: string) => FLOW_TAGS.has(t))) ||
    FLOW_PATH_MATCHERS.some((rx) => rx.test(path));

  const addCookieParam = (op: any) => {
    op.parameters ||= [];
    const already = op.parameters.some(
      (p: any) => p && p.in === 'cookie' && p.name === 'stepIndex',
    );
    if (!already) {
      op.parameters.push({
        name: 'stepIndex',
        in: 'cookie',
        required: false,
        description:
          'Current flow step. Server initializes on first request and increments thereafter.',
        schema: { type: 'integer', minimum: 0 },
        example: 2,
      });
    }
  };

  const ensureSetCookie = (op: any, status: string) => {
    op.responses ||= {};
    const resp = (op.responses[status] ||= { description: 'Success' });
    resp.headers ||= {};
    if (!resp.headers['Set-Cookie']) {
      resp.headers['Set-Cookie'] = {
        description:
          'Updated step cookie (e.g., `stepIndex=3; Path=/; HttpOnly; Secure; SameSite=Lax`). ' +
          'May be removed on completion.',
        schema: { type: 'string' },
        example: 'stepIndex=3; Path=/; HttpOnly; Secure; SameSite=Lax',
      };
    }
  };

  for (const [path, methods] of Object.entries(spec.paths ?? {})) {
    for (const [, op] of Object.entries<any>(methods as any)) {
      if (!op || typeof op !== 'object') continue;
      if (!shouldAnnotate(path, op)) continue;
      addCookieParam(op);
      // Add for common success statuses you use
      ensureSetCookie(op, '200');
      ensureSetCookie(op, '302');
    }
  }

  return spec;
};

export default addStepCookie;
