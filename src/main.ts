import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { NestExpressApplication } from "@nestjs/platform-express"
import { ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { ApiLogger } from "./utils/logger/api-logger.service"
import { LoggingInterceptor } from "./utils/interceptors/logging.interceptor"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  const apiLogger = new ApiLogger()

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))
  app.useBodyParser("json", { limit: "50mb" })
  app.enableCors({
    origin: [process.env.SPACE_URL, process.env.SUPERADMIN_URL].filter((url): url is string => !!url),
  })

  app.useGlobalInterceptors(new LoggingInterceptor(apiLogger))

  const config = new DocumentBuilder()
    .setTitle('Shira Library')
    .setDescription('Quiz and question template management API')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('swagger', app, document)

  const port = process.env.PORT || 3000
  await app.listen(port)
  apiLogger.log(`shira-library running on port ${port}`)
  apiLogger.log(`Swagger UI available at http://localhost:${port}/swagger`)
}
bootstrap();
