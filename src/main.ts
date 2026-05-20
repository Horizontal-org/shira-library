import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // remove
  app.enableCors({
    origin: [process.env.SPACE_URL],
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`shira-library running on port ${port}`);
}
bootstrap();
