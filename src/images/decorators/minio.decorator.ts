import { Inject } from "@nestjs/common";

export const MINIO_TOKEN = "LIBRARY_MINIO_INJECT_TOKEN";

export function InjectMinio(): ParameterDecorator {
  return Inject(MINIO_TOKEN);
}
