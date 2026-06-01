import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useBodyParser('json', { limit: '50mb' });
  app.enableCors({
    origin: [process.env.SPACE_URL, process.env.SUPERADMIN_URL].filter((url): url is string => !!url),
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`shira-library running on port ${port}`);
}
bootstrap();
