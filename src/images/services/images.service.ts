import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";
import { and, eq, inArray } from "drizzle-orm";
import { MySql2Database } from "drizzle-orm/mysql2";
import type { fileTypeFromBuffer } from "file-type";
import * as Minio from "minio";
import { DRIZZLE } from "../../db/drizzle.constants";
import { InjectMinio } from "../decorators/minio.decorator";
import { images } from "../../db/schema/images";
import { questionTemplateImages } from "../../db/schema/question-template-images";
import * as schema from "../../db/schema";
import { InvalidFileTypeImageException } from "../exceptions/invalid-file-type.image.exception";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

@Injectable()
export class ImagesService {
  private readonly bucketName: string;

  constructor(
    @Inject(DRIZZLE) private readonly db: MySql2Database<typeof schema>,
    @InjectMinio() private readonly minioService: Minio.Client,
    configService: ConfigService,
  ) {
    const bucketName = configService.get<string>("LIBRARY_IMAGE_BUCKET");
    if (!bucketName) throw new Error("LIBRARY_IMAGE_BUCKET environment variable is required");
    this.bucketName = bucketName;
  }

  async upload(file: Express.Multer.File, questionId?: number) {
    await this.validateFile(file);

    const hash = createHash("sha256").update(file.buffer).digest("hex");
    const [existing] = await this.db.select().from(images).where(eq(images.hash, hash));
    const image = existing ?? await this.storeNewImage(file, hash);

    if (questionId) await this.linkToQuestion([image.id], questionId);

    return { id: image.id, relativePath: image.relativePath };
  }

  async linkToQuestion(ids: number[], questionId: number): Promise<void> {
    if (!ids.length) return;

    const existing = await this.db
      .select({ imageId: questionTemplateImages.imageId })
      .from(questionTemplateImages)
      .where(and(eq(questionTemplateImages.questionId, questionId), inArray(questionTemplateImages.imageId, ids)));

    const alreadyLinked = new Set(existing.map((row) => row.imageId));
    const toLink = ids.filter((id) => !alreadyLinked.has(id));
    if (!toLink.length) return;

    await this.db.insert(questionTemplateImages).values(toLink.map((imageId) => ({ imageId, questionId })));
  }

  async findByQuestionId(questionId: number) {
    return this.db
      .select({
        id: images.id,
        name: images.name,
        relativePath: images.relativePath,
      })
      .from(questionTemplateImages)
      .innerJoin(images, eq(questionTemplateImages.imageId, images.id))
      .where(eq(questionTemplateImages.questionId, questionId));
  }

  async findByQuestionIds(questionIds: number[]) {
    if (!questionIds.length) return [];
    return this.db
      .select({
        questionId: questionTemplateImages.questionId,
        id: images.id,
        name: images.name,
        relativePath: images.relativePath,
      })
      .from(questionTemplateImages)
      .innerJoin(images, eq(questionTemplateImages.imageId, images.id))
      .where(inArray(questionTemplateImages.questionId, questionIds));
  }

  async getPresignedUrl(relativePath: string): Promise<string> {
    return this.minioService.presignedUrl("GET", this.bucketName, relativePath);
  }

  private async storeNewImage(file: Express.Multer.File, hash: string) {
    const relativePath = this.buildRelativePath(file.originalname);
    await this.minioService.putObject(this.bucketName, relativePath, file.buffer, file.size);

    const [result] = await this.db.insert(images).values({
      hash,
      relativePath,
      name: file.originalname,
    });

    return { id: result.insertId, relativePath };
  }

  private async validateFile(file: Express.Multer.File): Promise<void> {
    // Lazily required: file-type is ESM-only and only needs resolving when actually validating a file.
    const { fileTypeFromBuffer: detectFileType } = require("file-type") as { fileTypeFromBuffer: typeof fileTypeFromBuffer };
    const type = await detectFileType(file.buffer);
    if (!type || !ALLOWED_MIME_TYPES.includes(type.mime)) {
      throw new InvalidFileTypeImageException();
    }
  }

  private buildRelativePath(originalName: string): string {
    const timestamp = new Date().toISOString();
    const sanitized = this.sanitizeFileName(originalName);
    return `question-template-images/${timestamp}_${sanitized}`;
  }

  private sanitizeFileName(input: string): string {
    let output = "";
    for (let i = 0; i < input.length; i++) {
      if (input.charCodeAt(i) <= 127) output += input.charAt(i);
    }
    return output;
  }
}
