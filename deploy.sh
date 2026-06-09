echo "DEPLOY LIBRARY API"

echo "build docker image"

docker compose -f docker-compose.api.yml build library


echo "start docker image"

docker compose -f docker-compose.api.yml up -d library