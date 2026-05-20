export function validate(config: Record<string, unknown>) {
  const required = [
    "MYSQL_HOST",
    "MYSQL_PORT",
    "MYSQL_USER",
    "MYSQL_PASSWORD",
    "MYSQL_DATABASE",
    "JWT_SECRET",
    "SPACE_URL",
  ];
  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }
  return config;
}
