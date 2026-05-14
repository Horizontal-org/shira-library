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

## Environment Variables

| Variable       | Description                 |
| -------------- | --------------------------- |
| `DATABASE_URL` | MySQL connection string     |
| `JWT_SECRET`   | Secret for JWT signing      |
| `PORT`         | Server port (default: 3000) |
