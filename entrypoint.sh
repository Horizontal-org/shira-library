#!/bin/sh
set -e

if test "$1" = ""; then
  cd dist
  npm run db:migrate
  cd ..
  node dist/src/main.js
else
  exec "$@"
fi
