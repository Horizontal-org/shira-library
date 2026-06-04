import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { NestExpressApplication } from "@nestjs/platform-express";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))
  app.useBodyParser('json', { limit: '50mb' });
  app.enableCors({
    origin: [process.env.SPACE_URL, process.env.SUPERADMIN_URL].filter((url): url is string => !!url),
  });

  const config = new DocumentBuilder()
    .setTitle('Shira Library')
    .setDescription('Quiz and question template management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`shira-library running on port ${port}`);
  console.log(`Swagger UI available at http://localhost:${port}/swagger`);
}
bootstrap();
