FROM golang:1.24.8-bookworm AS build
RUN CGO_ENABLED=0 go install -trimpath -ldflags='-s -w' github.com/minio/minio@v0.0.0-20251015172955-9e49d5e7a648

FROM alpine:3.22
RUN apk add --no-cache ca-certificates
COPY --from=build /go/bin/minio /usr/local/bin/minio
ENTRYPOINT ["minio"]
