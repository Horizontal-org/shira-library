# Shira Library

<img src="Shira library v2.svg" alt="Shira Library Architecture" width="100%" />

[Interactive DB diagram](https://dbdiagram.io/d/Shira-library-v2-6a04c2757a923b9472a7642f)

A NestJS backend API service for quiz/question template management. Uses TypeScript, Drizzle ORM with MySQL, and JWT-based authentication.

## Getting Started

```bash
npm run start:dev   # Start dev server (port 3000)
npm run build       # Compile TypeScript
npm test            # Run Jest tests
```

## Database

```bash
docker compose up -d  # Start MySQL on localhost:3308
npm run db:generate   # Generate migration files
npm run db:migrate    # Apply migrations
```

## Environment Variables

| Variable | Description |
| -------- | ----------- |
| `MYSQL_HOST` | MySQL host |
| `MYSQL_PORT` | MySQL port |
| `MYSQL_DATABASE` | MySQL database name |
| `MYSQL_USER` | MySQL application user |
| `MYSQL_PASSWORD` | MySQL application password |
| `MYSQL_ROOT_PASSWORD` | MySQL root password for Docker initialization |
| `JWT_SECRET` | Secret for JWT signing |
| `PORT` | Server port (default: 3000) |
| `SPACE_URL` | Space App URL |
