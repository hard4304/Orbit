#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
TUNNEL_PID=""
TUNNEL_URL=""

cleanup() {
  echo ""
  echo "Shutting down tunnel..."
  if [[ -n "$TUNNEL_PID" ]]; then
    kill "$TUNNEL_PID" 2>/dev/null || true
    wait "$TUNNEL_PID" 2>/dev/null || true
  fi
  rm -f /tmp/tunnel-output.log
  echo "Done."
}
trap cleanup EXIT INT TERM

if command -v cloudflared &>/dev/null; then
  echo "Using cloudflared..."
  cloudflared tunnel --url "http://localhost:$PORT" &>/tmp/tunnel-output.log &
  TUNNEL_PID=$!

  # Wait for the URL to appear in output
  for i in $(seq 1 30); do
    TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' /tmp/tunnel-output.log 2>/dev/null | head -1 || true)
    if [[ -n "$TUNNEL_URL" ]]; then
      break
    fi
    sleep 1
  done

elif command -v ngrok &>/dev/null; then
  echo "Using ngrok..."
  ngrok http "$PORT" --log=stdout --log-format=json >/tmp/tunnel-output.log &
  TUNNEL_PID=$!

  for i in $(seq 1 15); do
    TUNNEL_URL=$(grep -oE 'https://[a-z0-9-]+\.ngrok-free\.app' /tmp/tunnel-output.log 2>/dev/null | head -1 || true)
    if [[ -n "$TUNNEL_URL" ]]; then
      break
    fi
    sleep 1
  done

else
  echo "Error: No tunnel tool found. Install one of:"
  echo "  brew install cloudflared    (recommended, free, no account)"
  echo "  brew install ngrok"
  exit 1
fi

if [[ -z "$TUNNEL_URL" ]]; then
  echo "Error: Could not extract tunnel URL. Check /tmp/tunnel-output.log"
  exit 1
fi

echo ""
echo "Tunnel active: $TUNNEL_URL -> localhost:$PORT"
echo ""

# Auto-set Telegram webhook
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
if [[ -f "$SCRIPT_DIR/set-webhook.sh" ]]; then
  bash "$SCRIPT_DIR/set-webhook.sh" "$TUNNEL_URL"
else
  echo "Warning: set-webhook.sh not found, skipping webhook setup"
fi

echo ""
echo "Press Ctrl+C to stop the tunnel"
wait "$TUNNEL_PID"
