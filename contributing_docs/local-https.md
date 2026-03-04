# Local HTTPS for E2E apps

This guide explains how to generate and refresh the TLS certificates used by the shared HTTPS reverse proxy in the `e2e` stack.

## Why this exists

Some capabilities (for example WebAuthn) require that the browser sees a fully trusted HTTPS origin. Instead of teaching every test app to serve HTTPS, we terminate TLS once at a lightweight proxy container and keep the individual apps on HTTP. The proxy reads a single certificate/key pair from `e2e/certs` and routes traffic (e.g., `/davinci`, `/ping-am`) to the existing services.

## One-time prerequisites

1. Install [`mkcert`](https://github.com/FiloSottile/mkcert):
   - macOS: `brew install mkcert nss`
   - Windows (Powershell): `choco install mkcert` or `scoop install mkcert`
   - Linux: use your package manager or download the binary
2. Trust the local root into the OS/browser store. Run `mkcert -install` (the script below will do this automatically if it has not been run before). Administrator/root approval may be needed.

If your device already trusts the Ping internal CA that issues the certificates, you can skip `mkcert` and instead place the relevant certificate/key in `e2e/certs`. For the default workflow we ship, we rely on `mkcert`.

## Bootstrap the certificate

From the repository root run:

```bash
pnpm run setup:https
```

`pnpm run setup:https` is a thin wrapper around `scripts/bootstrap-https.sh`. The script:

- Ensures `mkcert` is installed
- Installs the mkcert root CA into the system trust store if it is not present
- Creates (or refreshes) `e2e/certs/proxy-cert.pem` and `e2e/certs/proxy-key.pem` with SANs for `localhost`, `127.0.0.1`, and `::1`

> The files can safely be committed to your local clone—they should **not** be committed to git.

## Regenerating or customizing

- Re-run `pnpm run setup:https` at any time; it overwrites the pem files in place.
- To add additional hostnames (for example `dev.ping.local`), edit `DOMAIN_LIST` inside `scripts/bootstrap-https.sh` before re-running the script. Make sure the new hostnames resolve to your proxy (via `/etc/hosts`, corporate DNS, etc.).

## Docker integration

The `e2e/docker-compose.yml` proxy service mounts the mkcert outputs directly (`./certs/proxy-cert.pem` and `./certs/proxy-key.pem`) into `/etc/nginx/tls/`, matching the defaults baked into the Docker image.

When you run `pnpm https-proxy:up` (or directly `docker compose -f e2e/docker-compose.yml up`), the proxy serves `https://localhost:8443/...` using the freshly generated certificate. Because the root CA is trusted, browsers treat the origin as fully secure and WebAuthn flows work without security errors.

If you are using a corporate-managed device, your IT team can distribute the mkcert root CA (or an equivalent internal CA) via MDM so that new developers do not need to run `mkcert -install` manually.

## Troubleshooting

- **Browser warning persists**: Confirm the mkcert root CA is installed in the OS trust store (run `mkcert -CAROOT` to locate it). Remove any stale certificates and rerun the bootstrap script.
- **mkcert not found**: Ensure it is on your `PATH`. Open a new shell after installation.
- **Permission issues on install**: `mkcert -install` modifies OS certificate stores and may require elevated privileges. Run the script again with the necessary rights.

With the certificate in place, the HTTPS proxy is ready and the E2E apps can rely on secure origins without per-app TLS configuration.

## Running Applications Behind the Proxy

When running an application that needs to be accessed by the HTTPS proxy, you must ensure that its development server is accessible from within the Docker network.

For Vite-based applications (like `oidc-app` or `davinci-app`), you need to start the dev server with the `--host=0.0.0.0` flag. This tells the server to listen on all available network interfaces, not just `localhost`. This is essential for the `nginx` proxy container to be able to connect to your application's dev server.

Here is an example command:

```bash
pnpm nx run @forgerock/davinci-app:nxServe --port=5173 --host=0.0.0.0
```

If you forget to add `--host=0.0.0.0`, the proxy will not be able to reach your application, and you will see a "502 Bad Gateway" error in your browser.
