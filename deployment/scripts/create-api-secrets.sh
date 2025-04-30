#!/bin/bash

# Exit on error
set -e

# Namespace for the secrets
NAMESPACE="production"

# Create namespace if it doesn't exist
kubectl get namespace $NAMESPACE || kubectl create namespace $NAMESPACE

# If there is a DATABASE_URL in env, create a secret, otherwise continue
if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set. Skipping database secret creation."
else
  echo "Creating database secret..."
  kubectl create secret generic db-credentials \
    --namespace $NAMESPACE \
    --from-literal=DATABASE_URL="${DATABASE_URL}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

# If there is a JWT_SECRET in env, create a secret, otherwise continue
if [ -z "$JWT_SECRET" ]; then
  echo "JWT_SECRET is not set. Skipping JWT secret creation."
else
  echo "Creating JWT secret..."
  kubectl create secret generic jwt-secret \
    --namespace $NAMESPACE \
    --from-literal=JWT_SECRET="${JWT_SECRET}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

# If there is a MAILGUN_API_KEY in env, create a secret, otherwise continue
if [ -z "$MAILGUN_API_KEY" ]; then
  echo "MAILGUN_API_KEY is not set. Skipping Mailgun secret creation."
else
  echo "Creating Mailgun secret..."
  kubectl create secret generic mailgun-credentials \
    --namespace $NAMESPACE \
    --from-literal=MAILGUN_API_KEY="${MAILGUN_API_KEY}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi

# If there is an OPENAI_API_KEY in env, create a secret, otherwise continue
if [ -z "$OPENAI_API_KEY" ]; then
  echo "OPENAI_API_KEY is not set. Skipping OpenAI secret creation."
else
  echo "Creating OpenAI secret..."
  kubectl create secret generic openai-credentials \
    --namespace $NAMESPACE \
    --from-literal=OPENAI_API_KEY="${OPENAI_API_KEY}" \
    --dry-run=client -o yaml | kubectl apply -f -
fi