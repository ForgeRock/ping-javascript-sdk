import { Schema } from 'effect';

export const AuthEventTypeSchema = Schema.Union(
  Schema.Literal('network:request'),
  Schema.Literal('network:response'),
  Schema.Literal('network:cors-flag'),
  Schema.Literal('sdk:node-change'),
  Schema.Literal('sdk:action'),
  Schema.Literal('sdk:config'),
  Schema.Literal('sdk:journey-step'),
  Schema.Literal('sdk:oidc-state'),
  Schema.Literal('dom:form-submit'),
  Schema.Literal('dom:redirect'),
  Schema.Literal('session:cookie'),
  Schema.Literal('session:storage'),
);

export const AuthEventFlagsSchema = Schema.Struct({
  isCors: Schema.Boolean,
  isError: Schema.Boolean,
  isAuthRelated: Schema.Boolean,
});

export const CorsFlagSchema = Schema.Struct({
  url: Schema.String,
  reason: Schema.Union(
    Schema.Literal('status-zero'),
    Schema.Literal('missing-allow-origin'),
    Schema.Literal('credentials-mismatch'),
    Schema.Literal('wildcard-with-credentials'),
    Schema.Literal('preflight-failed'),
  ),
  method: Schema.String,
  preflightStatus: Schema.optional(Schema.Number),
  allowOrigin: Schema.optional(Schema.String),
  allowCredentials: Schema.optional(Schema.String),
});

export type CorsFlag = Schema.Schema.Type<typeof CorsFlagSchema>;

export const NetworkDataSchema = Schema.Struct({
  _tag: Schema.Literal('network'),
  url: Schema.String,
  method: Schema.String,
  status: Schema.Number,
  requestHeaders: Schema.Record({ key: Schema.String, value: Schema.String }),
  responseHeaders: Schema.Record({ key: Schema.String, value: Schema.String }),
  duration: Schema.Number,
  corsFlag: Schema.optional(CorsFlagSchema),
  requestBody: Schema.optional(Schema.Unknown),
  responseBody: Schema.optional(Schema.Unknown),
});

export const SdkErrorSchema = Schema.Struct({
  code: Schema.String,
  message: Schema.String,
  type: Schema.String,
  internalHttpStatus: Schema.optional(Schema.Number),
});

export const SdkAuthorizationSchema = Schema.Struct({
  code: Schema.optional(Schema.String),
  state: Schema.optional(Schema.String),
});

export const SdkDataSchema = Schema.Struct({
  _tag: Schema.Literal('sdk'),
  nodeStatus: Schema.String,
  previousStatus: Schema.optional(Schema.String),
  interactionId: Schema.optional(Schema.String),
  interactionToken: Schema.optional(Schema.String),
  nodeId: Schema.optional(Schema.String),
  requestId: Schema.optional(Schema.String),
  nodeName: Schema.optional(Schema.String),
  nodeDescription: Schema.optional(Schema.String),
  eventName: Schema.optional(Schema.String),
  httpStatus: Schema.optional(Schema.Number),
  collectors: Schema.optional(Schema.Array(Schema.Unknown)),
  error: Schema.optional(SdkErrorSchema),
  authorization: Schema.optional(SdkAuthorizationSchema),
  session: Schema.optional(Schema.String),
  responseBody: Schema.optional(Schema.Unknown),
});

export const SdkConfigDataSchema = Schema.Struct({
  _tag: Schema.Literal('sdk-config'),
  config: Schema.Unknown,
});

export const DomDataSchema = Schema.Struct({
  _tag: Schema.Literal('dom'),
  element: Schema.optional(Schema.String),
  url: Schema.optional(Schema.String),
});

export const SessionDataSchema = Schema.Struct({
  _tag: Schema.Literal('session'),
  key: Schema.String,
  before: Schema.optional(Schema.String),
  after: Schema.optional(Schema.String),
});

export const JourneyDataSchema = Schema.Struct({
  _tag: Schema.Literal('journey'),
  stepType: Schema.Union(
    Schema.Literal('Step'),
    Schema.Literal('LoginSuccess'),
    Schema.Literal('LoginFailure'),
  ),
  callbacks: Schema.optional(Schema.Array(Schema.Unknown)),
  authId: Schema.optional(Schema.String),
  tokenId: Schema.optional(Schema.String),
  successUrl: Schema.optional(Schema.String),
  realm: Schema.optional(Schema.String),
  stage: Schema.optional(Schema.String),
  header: Schema.optional(Schema.String),
  description: Schema.optional(Schema.String),
  errorCode: Schema.optional(Schema.Number),
  errorMessage: Schema.optional(Schema.String),
  errorReason: Schema.optional(Schema.String),
});

export const OidcDataSchema = Schema.Struct({
  _tag: Schema.Literal('oidc'),
  phase: Schema.Union(
    Schema.Literal('authorize'),
    Schema.Literal('exchange'),
    Schema.Literal('revoke'),
    Schema.Literal('userinfo'),
    Schema.Literal('logout'),
  ),
  status: Schema.Union(Schema.Literal('success'), Schema.Literal('error')),
  clientId: Schema.optional(Schema.String),
  errorCode: Schema.optional(Schema.String),
  errorMessage: Schema.optional(Schema.String),
});

export const OidcPkceSchema = Schema.Struct({
  challengeMethod: Schema.String,
  hasVerifier: Schema.Boolean,
});

export const OidcDpopSchema = Schema.Struct({
  proofJwt: Schema.optional(Schema.String),
  tokenType: Schema.optional(Schema.String),
  nonce: Schema.optional(Schema.String),
});

export const OidcParSchema = Schema.Struct({
  requestUri: Schema.optional(Schema.String),
  expiresIn: Schema.optional(Schema.Number),
});

export const OidcTokensSchema = Schema.Struct({
  accessToken: Schema.optional(Schema.Boolean),
  refreshToken: Schema.optional(Schema.Boolean),
  idToken: Schema.optional(Schema.Boolean),
  tokenType: Schema.optional(Schema.String),
  expiresIn: Schema.optional(Schema.Number),
});

export const OidcErrorSchema = Schema.Struct({
  error: Schema.String,
  errorDescription: Schema.optional(Schema.String),
});

export const OidcSemanticsSchema = Schema.Struct({
  _tag: Schema.Literal('oidc-semantics'),
  oidcPhase: Schema.Union(
    Schema.Literal('discovery'),
    Schema.Literal('authorize'),
    Schema.Literal('par'),
    Schema.Literal('token'),
    Schema.Literal('userinfo'),
    Schema.Literal('revocation'),
    Schema.Literal('introspection'),
    Schema.Literal('end-session'),
    Schema.Literal('jwks'),
  ),
  grantType: Schema.optional(Schema.String),
  pkce: Schema.optional(OidcPkceSchema),
  dpop: Schema.optional(OidcDpopSchema),
  par: Schema.optional(OidcParSchema),
  state: Schema.optional(Schema.String),
  nonce: Schema.optional(Schema.String),
  clientId: Schema.optional(Schema.String),
  tokens: Schema.optional(OidcTokensSchema),
  error: Schema.optional(OidcErrorSchema),
});

export type OidcSemantics = Schema.Schema.Type<typeof OidcSemanticsSchema>;

export const AuthEventSchema = Schema.Struct({
  id: Schema.String,
  timestamp: Schema.Number,
  type: AuthEventTypeSchema,
  source: Schema.Union(
    Schema.Literal('network'),
    Schema.Literal('sdk'),
    Schema.Literal('dom'),
    Schema.Literal('session'),
  ),
  flowId: Schema.NullOr(Schema.String),
  causedBy: Schema.NullOr(Schema.String),
  data: Schema.Union(
    NetworkDataSchema,
    SdkDataSchema,
    SdkConfigDataSchema,
    DomDataSchema,
    SessionDataSchema,
    JourneyDataSchema,
    OidcDataSchema,
  ),
  flags: AuthEventFlagsSchema,
  oidcSemantics: Schema.optional(OidcSemanticsSchema),
});
