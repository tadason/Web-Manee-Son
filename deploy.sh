#!/bin/bash

set -e

PROJECT_ID="login-maneeson"
SERVICE_NAME="web-manee-son"
REGION="asia-southeast1"

echo "🚀 Deploying Web-Manee-Son to Cloud Run..."

# Set project
gcloud config set project $PROJECT_ID

# Extract GEMINI_API_KEY from .env
GEMINI_KEY=$(grep GEMINI_API_KEY .env | cut -d '=' -f2- | tr -d ' ')

echo "📦 Building and deploying to $REGION..."

gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --set-env-vars "GEMINI_API_KEY=$GEMINI_KEY" \
  --set-env-vars "NODE_ENV=production" \
  --quiet

echo "✅ Deployment submitted!"

# Get the service URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format='value(status.url)' 2>/dev/null || echo "pending...")
echo "🌐 Service URL: $SERVICE_URL"
