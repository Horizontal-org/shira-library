import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { AuthModule } from "./auth/auth.module";
import { JwtAuthGuard } from "./auth/jwt-auth.guard";
import { DrizzleModule } from "./db/drizzle.module";
import { QuizTemplatesModule } from "./quiz-templates/quiz-templates.module";
import { QuestionTemplatesModule } from "./question-templates/question-templates.module";
import { LangTagsModule } from "./lang-tags/lang-tags.module";
import { ConsoleModule } from "nestjs-console";
import { TagsModule } from "./tags/tags.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ConsoleModule,
    DrizzleModule,
    AuthModule,
    QuizTemplatesModule,
    QuestionTemplatesModule,
    LangTagsModule,
    TagsModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
