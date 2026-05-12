import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { DRIZZLE } from "../db/drizzle.constants";
import { questionTemplates } from "../db/schema/question-templates";
import * as schema from "../db/schema";

@Injectable()
export class QuestionTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) {}

  async findByQuiz(quizTemplateId: number) {
    return this.db
      .select()
      .from(questionTemplates)
      .where(eq(questionTemplates.quizTemplateId, quizTemplateId))
      .orderBy(questionTemplates.order);
  }

  async findOne(id: number) {
    const [result] = await this.db.select().from(questionTemplates).where(eq(questionTemplates.id, id));
    return result ?? null;
  }

  async create(data: {
    quizTemplateId: number;
    question: string;
    type: string;
    options?: string;
    correctAnswer: string;
    order?: number;
  }) {
    const [result] = await this.db.insert(questionTemplates).values(data);
    return this.findOne(result.insertId);
  }

  async update(
    id: number,
    data: {
      question?: string;
      type?: string;
      options?: string;
      correctAnswer?: string;
      order?: number;
    },
  ) {
    await this.db.update(questionTemplates).set(data).where(eq(questionTemplates.id, id));
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.delete(questionTemplates).where(eq(questionTemplates.id, id));
  }
}
