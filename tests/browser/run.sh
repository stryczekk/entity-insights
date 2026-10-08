#!/bin/sh
# Browser test: loads the module in headless Chromium with a fake `hass` - a
# made-up home with 100 days of generated history (fixture.js) - opens the
# dialog for lights, a switch and a cover, clicks through it and checks what
# it renders and which calls it makes. No real devices, no Home Assistant.
#   tests/browser/run.sh           -> results, exit code 1 on failure
#   tests/browser/run.sh --shots   -> also writes the README screenshots to docs/
set -e
cd "$(dirname "$0")/../.."
PORT=${PORT:-8766}
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
# fresh profile every run: a persistent one can serve a CACHED copy of the
# module, and the test would silently check an old version
PROFILE=$(mktemp -d)
trap 'kill $SERVER 2>/dev/null; rm -rf "$PROFILE"' EXIT
sleep 1
CHROME=${CHROME:-$(command -v chromium || command -v chromium-browser || command -v google-chrome)}
FLAGS="--headless --no-sandbox --disable-gpu --hide-scrollbars --virtual-time-budget=30000 --user-data-dir=$PROFILE"
URL="http://127.0.0.1:$PORT/tests/browser/harness.html"
OUT=$("$CHROME" $FLAGS --dump-dom "$URL" 2>/dev/null \
  | sed -n '/<pre id="results">/,/<\/pre>/p' | sed -e 's/<[^>]*>//g' -e 's/&gt;/>/g' -e 's/&lt;/</g' -e 's/&amp;/\&/g' -e 's/&quot;/"/g')
echo "$OUT"
if [ "$1" = "--shots" ]; then
  mkdir -p docs
  # a phone: 390 x 844 CSS px at 2x
  for s in "light en 14" "cover en 30" "lamp en 90"; do
    set -- $s
    "$CHROME" $FLAGS --window-size=390,844 --force-device-scale-factor=2 --screenshot="docs/screenshot-$1-$2.png" \
      "$URL?shot=$1&lang=$2&range=$3" >/dev/null 2>&1
    echo "screenshot: docs/screenshot-$1-$2.png"
  done
fi
echo "$OUT" | grep -q "^OK "
