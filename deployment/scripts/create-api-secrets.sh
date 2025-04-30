#!/bin/bash

# Exit on error
set -e

# Namespace for the secrets
NAMESPACE="production"

# Create namespace if it doesn't exist
kubectl get namespace $NAMESPACE || kubectl create namespace $NAMESPACE

# Create database secret
kubectl create secret generic db-credentials \
  --namespace $NAMESPACE \
  --from-literal=DATABASE_URL="${DATABASE_URL}" \
  --dry-run=client -o yaml | kubectl apply -f -

# Create JWT secret
kubectl create secret generic jwt-secret \
  --namespace $NAMESPACE \
  --from-literal=JWT_SECRET="${JWT_SECRET}" \
  --dry-run=client -o yaml | kubectl apply -f -

# Create Mailgun API key secret
kubectl create secret generic mailgun-credentials \
  --namespace $NAMESPACE \
  --from-literal=MAILGUN_API_KEY="${MAILGUN_API_KEY}" \
  --dry-run=client -o yaml | kubectl apply -f -

# Create OpenAI API key secret
kubectl create secret generic openai-credentials \
  --namespace $NAMESPACE \
  --from-literal=OPENAI_API_KEY="${OPENAI_API_KEY}" \
  --dry-run=client -o yaml | kubectl apply -f -

echo "Secrets have been created or updated in the '$NAMESPACE' namespace."