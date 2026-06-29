import { NestFactory } from "@nestjs/core"
import { AppModule } from "./app.module"
import { NestExpressApplication } from "@nestjs/platform-express"
import { ValidationPipe } from "@nestjs/common"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import { Logger } from "nestjs-pino"
import * as cookieParser from "cookie-parser"
import helmet from "helmet"

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  app.set('trust proxy', 1)
  app.use(helmet())
  app.use(cookieParser())

  // TODO: CORS decision needed — public endpoints are now unauthenticated.
  // Option A: keep the current allowlist (SPACE_URL + SUPERADMIN_URL) — fine if all
  //           callers are known and controlled (e.g. your own frontend only).
  // Option B: open to any origin (origin: '*') — required if third parties need to
  //           fetch public endpoints from a browser. Cannot be combined with credentials: true.
  // Option C: split config — '*' for public GET routes, allowlist for mutating routes.
  const origins = [process.env.SPACE_URL, process.env.SUPERADMIN_URL].filter((url): url is string => !!url)
  app.enableCors({
    origin: origins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }))
  app.useBodyParser("json", { limit: "1mb" })

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Shira Library')
      .setDescription('Quiz and question template management API')
      .setVersion('1.0')
      .addBearerAuth()
      .build()
    const document = SwaggerModule.createDocument(app, config)
    SwaggerModule.setup('swagger', app, document)
  }

  const port = process.env.PORT || 3000
  await app.listen(port)
}
bootstrap()
