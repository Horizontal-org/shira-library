import { Inject, Injectable } from "@nestjs/common";
import { MySql2Database } from "drizzle-orm/mysql2";
import { DRIZZLE } from "@/db/drizzle.constants";
import { CreateQuestionTemplatesService } from "./create.question-templates.service";
import { AuthorsService } from "@/authors/services/authors.service";
import { PublishQuestionTemplateDto } from "../dto/publish-question-template.dto";
import { TagsService } from "@/tags/services/tags.service";
import { LangTagsService } from "@/lang-tags/services/lang-tags.service";

import * as schema from "../../db/schema"
import { questionTags } from "../../db/schema/question-tags"
import { questionLangTags } from "../../db/schema/question-lang-tags"
import { publishEvents } from "../../db/schema/publish-events"

@Injectable()
export class PublishQuestionTemplatesService {
  constructor(
    @Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>,
    private readonly authorsService: AuthorsService,
    private readonly createQuestionTemplatesService: CreateQuestionTemplatesService,
    private readonly tagsService: TagsService,
    private readonly langTagsService: LangTagsService,
  ) { }

  async publish(data: PublishQuestionTemplateDto): Promise<void> {
    await Promise.all([
      this.tagsService.validateIds(data.tagIds ?? []),
      this.langTagsService.validateIds(data.langTagIds ?? []),
    ])

    const author = await this.authorsService.findOrCreate({
      publicSpaceId: data.author.publicSpaceId,
      spaceName: data.author.spaceName,
      spaceDisplayName: data.author.spaceDisplayName,
      organizationName: data.author.organizationName,
    })

    const questionId = await this.createQuestionTemplatesService.create({
      name: data.name,
      content: data.content,
      appType: data.appType,
      defaultApp: data.defaultApp,
      isPhishing: data.isPhishing,
      isDemo: false,
      highlighted: false,
      approved: false,
      authorId: author.id,
      explanations: data.explanations?.map((exp) => ({
        position: exp.position,
        positionIndex: String(exp.index),
        content: exp.content,
      })),
    })

    if (data.tagIds?.length) {
      await this.db.insert(questionTags).values(
        data.tagIds.map((tagId) => ({ questionId, tagId })),
      )
    }

    if (data.langTagIds?.length) {
      await this.db.insert(questionLangTags).values(
        data.langTagIds.map((langTagId) => ({ questionId, langTagId })),
      )
    }

    await this.db.insert(publishEvents).values({
      resourceType: 'question_template',
      resourceId: String(questionId),
      authorId: author.id,
      status: 'in_review',
    })

    return
  }

}