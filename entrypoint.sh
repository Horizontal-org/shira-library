#!/bin/sh
set -e

npm run db:migrate
cd dist
npm run db:migrate
cd ..

if test "$1" = ""; then
  node dist/src/main.js
else
  exec "$@"
fi
