#!/usr/bin/env bash
set -euo pipefail

# Usage: ./scripts/set-webhook.sh <public-url>
# Reads TELEGRAM_BOT_TOKEN and TELEGRAM_WEBHOOK_SECRET from .env.local

BASE_URL="${1:?Usage: $0 <public-url>}"
WEBHOOK_URL="${BASE_URL}/api/telegram/webhook"

ENV_FILE=".env.local"
if [[ ! -f "$ENV_FILE" ]]; then
  echo "Error: $ENV_FILE not found"
  exit 1
fi

BOT_TOKEN=$(grep -E '^TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | cut -d'=' -f2-)
WEBHOOK_SECRET=$(grep -E '^TELEGRAM_WEBHOOK_SECRET=' "$ENV_FILE" | cut -d'=' -f2-)

if [[ -z "$BOT_TOKEN" ]]; then
  echo "Error: TELEGRAM_BOT_TOKEN not found in $ENV_FILE"
  exit 1
fi

echo "Setting webhook to: $WEBHOOK_URL"

PAYLOAD="{\"url\":\"$WEBHOOK_URL\""
if [[ -n "$WEBHOOK_SECRET" ]]; then
  PAYLOAD="$PAYLOAD,\"secret_token\":\"$WEBHOOK_SECRET\""
fi
PAYLOAD="$PAYLOAD}"

RESPONSE=$(curl -s -X POST \
  "https://api.telegram.org/bot${BOT_TOKEN}/setWebhook" \
  -H "Content-Type: application/json" \
  -d "$PAYLOAD")

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q '"ok":true'; then
  echo "Webhook set successfully!"
else
  echo "Failed to set webhook"
  exit 1
fi
