FROM golang:1.23-alpine AS build
LABEL org.opencontainers.image.source=https://github.com/moby-it/planning-poker
WORKDIR /app
COPY ./ ./
# The templates and static assets are embedded, so this really is the whole app.
RUN go build -o bin/

FROM alpine:3.20
LABEL org.opencontainers.image.source=https://github.com/moby-it/planning-poker
WORKDIR /app
# Non-root runtime (security audit finding H1). The binary embeds its templates
# and static assets and keeps rooms in memory, so it needs no writable paths.
RUN addgroup -S app && adduser -S -G app -h /app app
COPY --from=build --chown=app:app /app/bin/poker-planning ./
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1
USER app
CMD [ "./poker-planning" ]
