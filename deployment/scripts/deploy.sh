#!/bin/bash

# Exit on error
set -e

# Check required env vars
: "${NAMESPACE:=default}"
: "${RELEASE_NAME:=?Release name is required}"

helm upgrade --install "$RELEASE_NAME" \
  --namespace "$NAMESPACE" \
  --create-namespace \
  --values deployment/values.yaml \
  --set api.image.tag=${RELEASE_TAG:=latest} \
  --set cronjob.image.tag=${RELEASE_TAG:=latest} \
  deployment/
