#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

exec ./node_modules/.bin/tsup lib/index.js --format cjs,esm --clean \
  --external react \
  --external react-dom \
  --external react-dom/client \
  --external react/jsx-runtime \
  --external react-router \
  --external @testing-library/react \
  --external @testing-library/user-event \
  --external @testing-library/dom
