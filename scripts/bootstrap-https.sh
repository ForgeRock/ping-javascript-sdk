#!/usr/bin/env bash
set -euo pipefail

CERT_DIR="$(git rev-parse --show-toplevel)/e2e/certs"
DOMAIN_LIST=("localhost" "127.0.0.1" "::1")

mkdir -p "${CERT_DIR}"

if ! command -v mkcert >/dev/null 2>&1; then
  echo "mkcert not found; install it first." >&2
  exit 1
fi

pushd "${CERT_DIR}" >/dev/null

if [ ! -f "$(mkcert -CAROOT)/rootCA.pem" ]; then
  echo "Installing mkcert root CA..."
  mkcert -install
fi

echo "Generating proxy certificate..."
mkcert -cert-file proxy-cert.pem -key-file proxy-key.pem "${DOMAIN_LIST[@]}"

popd >/dev/null

echo "Certificate material written to ${CERT_DIR}"
