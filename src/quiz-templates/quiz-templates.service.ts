import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import { DRIZZLE } from "../db/drizzle.constants";
import { quizTemplates } from "../db/schema/quiz-templates";
import * as schema from "../db/schema";

@Injectable()
export class QuizTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async findAll() {

    // return this.db.select().from(quizTemplates);
    return [
      {
        title: '10 most common phishing attacks in the US (2026)',
        createdAt: '2026-05-04',
        author: 'Shira Team',
        description: '10 questions using the actual top 10 email and social media scams.',
        languages: ['English', 'Spanish'],
        tags: ['North America', 'actual attacks', 'another tag']
      },
      {
        title: 'Banking scams',
        createdAt: '2026-03-04',
        author: 'Shira Team',
        description: 'Bank-related phishing attacks over email and messaging apps.',
        languages: ['English', 'French'],
        tags: ['banking', 'actual attacks', 'another tag']
      }
    ];

  }

  async findOne(id: number) {
    const [result] = await this.db.select().from(quizTemplates).where(eq(quizTemplates.id, id));
    return result ?? null;
  }

  async create(data: { title: string; description?: string; createdBy: string }) {
    const [result] = await this.db.insert(quizTemplates).values(data);
    return this.findOne(result.insertId);
  }

  async update(id: number, data: { title?: string; description?: string }) {
    await this.db.update(quizTemplates).set(data).where(eq(quizTemplates.id, id));
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.db.delete(quizTemplates).where(eq(quizTemplates.id, id));
  }
}
