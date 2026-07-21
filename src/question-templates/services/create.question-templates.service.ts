import { Inject, Injectable } from "@nestjs/common"
import { MySql2Database } from "drizzle-orm/mysql2"
import { DRIZZLE } from "../../db/drizzle.constants"
import * as schema from "../../db/schema"
import { questionTemplates } from "../../db/schema/question-templates"
import { explanationTemplates } from "../../db/schema/explanation-templates"

export type CreateQuestionExplanationInput = {
  position: string
  positionIndex: string
  content: string
}

export type CreateQuestionTemplateInput = {
  name: string
  content: string
  appType: string
  defaultApp?: string
  isPhishing: boolean
  isDemo?: boolean
  highlighted?: boolean
  approved?: boolean
  authorId?: number
  explanations?: CreateQuestionExplanationInput[]
}

@Injectable()
export class CreateQuestionTemplatesService {
  constructor(@Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>) { }

  async create(data: CreateQuestionTemplateInput): Promise<number> {

    const [result] = await this.db.insert(questionTemplates).values({
      name: data.name,
      content: data.content,
      appType: data.appType,
      defaultApp: data.defaultApp,
      isPhishing: data.isPhishing,
      isDemo: data.isDemo ?? false,
      highlighted: data.highlighted ?? false,
      approved: data.approved ?? false,
      authorId: data.authorId,
    })

    const questionId = result.insertId

    if (data.explanations?.length) {
      await this.db.insert(explanationTemplates).values(
        data.explanations.map((exp) => ({
          questionId,
          position: exp.position,
          positionIndex: exp.positionIndex,
          content: exp.content,
        })),
      )
    }

    return questionId
  }
}
