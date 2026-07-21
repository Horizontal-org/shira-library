import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { DrizzleModule } from "./db/drizzle.module";
import { QuizTemplatesModule } from "./quiz-templates/quiz-templates.module";
import { QuestionTemplatesModule } from "./question-templates/question-templates.module";
import { LangTagsModule } from "./lang-tags/lang-tags.module";
import { ConsoleModule } from "nestjs-console";
import { TagsModule } from "./tags/tags.module";
import { AuthorsModule } from "./authors/authors.module";
import { LoggerModule } from "nestjs-pino";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        // Default: applied to all public GET endpoints
        name: 'default',
        ttl: 60_000,
        limit: 60,
      },
      {
        // Strict: apply with @Throttle({ strict: {} }) on public POST endpoints
        name: 'strict',
        ttl: 60_000,
        limit: 10,
      },
    ]),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: process.env.NODE_ENV !== "production"
          ? { target: "pino-pretty" }
          : undefined,
      },
    }),
    ConsoleModule,
    DrizzleModule,
    AuthModule,
    QuizTemplatesModule,
    QuestionTemplatesModule,
    LangTagsModule,
    TagsModule,
    AuthorsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
