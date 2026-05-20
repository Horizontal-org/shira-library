import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { validate } from "./config/env.validation";
import { DrizzleModule } from "./db/drizzle.module";
import { QuizTemplatesModule } from "./quiz-templates/quiz-templates.module";
import { QuestionTemplatesModule } from "./question-templates/question-templates.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    DrizzleModule,
    AuthModule,
    QuizTemplatesModule,
    QuestionTemplatesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
