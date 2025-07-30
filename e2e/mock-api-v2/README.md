A mock API server for simulating Ping Identity and OpenID Connect flows, built using [Effect](https://effect.website/) and [@effect/platform](https://github.com/Effect-TS/platform). This service is designed for end-to-end testing and development, providing realistic responses for authentication and authorization scenarios.

## Features

- Implements endpoints for:
  - Healthcheck
  - OpenID Connect Discovery
  - Davinci Authorization
  - Token acquisition
  - UserInfo (protected, requires Bearer token)

- Uses Effect and @effect/platform for functional, type-safe API definition and handling.
- Includes middleware for logging, CORS, cookie management, and Bearer token authorization.

## Tech Stack

- [Effect](https://effect.website/)
- [@effect/platform](https://github.com/Effect-TS/platform)
- Node.js (via @effect/platform-node)
- TypeScript

## Getting Started

### Install dependencies

```sh
pnpm install
```

### Build

```sh
pnpm build
```

### Run the server

```sh
pnpm serve
```

The server will start on port `9443`.

### Run tests

```sh
pnpm test
```

## API Overview

### Healthcheck

- `GET /healthcheck`
- Returns `"Healthy"` if the server is running.

### OpenID Connect Discovery

- `GET /:envid/as/.well-known/openid-configuration`
- Returns a static OpenID configuration response.

### Davinci Authorization

- `GET /:envid/as/authorize`
- Accepts query parameters for authorization.
- Returns a mock authorization response.

### Token Endpoint

- `POST /:envid/as/token`
- Returns a mock access token response.

### UserInfo (Protected)

- `GET /:envid/as/userinfo`
- Requires a valid Bearer token.
- Returns mock user information.

### End Session

- `GET /:envid/as/endSession`
- Ends the user's session.
- Accepts `post_logout_redirect_uri` and `state` query parameters for redirects.
- Returns a confirmation message.

## Notes

- The `customHtmlRoutes` and related endpoints are not currently implemented.
- All endpoints return static or mock data for testing purposes.

## License

MIT © Ping Identity Corporation
