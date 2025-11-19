#!/bin/sh
set -eu

template="/etc/nginx/templates/default.conf.template"
output="/etc/nginx/conf.d/default.conf"

echo "[https-proxy] Rendering nginx config..."
envsubst '\
${LISTEN_PORT} \
${SSL_CERT_PATH} \
${SSL_CERT_KEY_PATH} \
${DAVINCI_UPSTREAM} \
${OIDC_UPSTREAM} \
${PROTECT_UPSTREAM} \
${DEVICE_UPSTREAM} \
${MOCK_API_UPSTREAM} \
' < "$template" > "$output"
