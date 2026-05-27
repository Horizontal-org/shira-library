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

## Console Commands

Commands run against the database without starting the HTTP server. Pass flags after `--` to prevent npm from consuming them.

```bash
npm run console <command> [options]
```

### `list-questions`

Lists all question templates in a table.

```bash
npm run console list-questions
```

### `list-quizzes`

Lists all quiz templates in a table.

```bash
npm run console list-quizzes
```

### `assemble-quiz`

Creates a new quiz with up to 10 random questions. Links one lang tag to the quiz if any exist in the database.

```bash
npm run console assemble-quiz -- --title "My Quiz"
```

| Option | Required | Description |
| --- | --- | --- |
| `-t, --title <title>` | Yes | Title for the new quiz |

## Environment Variables

| Variable       | Description                 |
| -------------- | --------------------------- |
| `DATABASE_URL` | MySQL connection string     |
| `JWT_SECRET`   | Secret for JWT signing      |
| `PORT`         | Server port (default: 3000) |
