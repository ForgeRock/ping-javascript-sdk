FROM nginx:1.27-alpine

RUN apk add --no-cache gettext

ENV LISTEN_PORT=8443 \
    SSL_CERT_PATH=/etc/nginx/tls/proxy-cert.pem \
    SSL_CERT_KEY_PATH=/etc/nginx/tls/proxy-key.pem \
    DAVINCI_UPSTREAM=host.docker.internal:5829 \
    OIDC_UPSTREAM=host.docker.internal:5173 \
    PROTECT_UPSTREAM=host.docker.internal:4300 \
    DEVICE_UPSTREAM=host.docker.internal:4301 \
    MOCK_API_UPSTREAM=host.docker.internal:9443

COPY default.conf.template /etc/nginx/templates/default.conf.template
COPY docker-entrypoint.d/ /docker-entrypoint.d/

EXPOSE 8443

