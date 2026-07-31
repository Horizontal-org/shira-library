import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as Minio from "minio";
import { ImagesController } from "./controllers/images.controller";
import { ImagesService } from "./services/images.service";
import { ImagesCommand } from "./images.command";
import { MINIO_TOKEN } from "./decorators/minio.decorator";

@Module({
  controllers: [ImagesController],
  providers: [
    ImagesService,
    ImagesCommand,
    {
      provide: MINIO_TOKEN,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Minio.Client => {
        const endPoint = configService.get<string>("LIBRARY_IMAGE_ENDPOINT");
        const port = configService.get<string>("LIBRARY_IMAGE_PORT");
        const accessKey = configService.get<string>("LIBRARY_IMAGE_ACCESS_KEY");
        const secretKey = configService.get<string>("LIBRARY_IMAGE_SECRET_KEY");
        const useSSL = configService.get<string>("LIBRARY_IMAGE_USE_SSL") === "true";
        if (!endPoint || !port || !accessKey || !secretKey) {
          throw new Error("LIBRARY_IMAGE_ENDPOINT, LIBRARY_IMAGE_PORT, LIBRARY_IMAGE_ACCESS_KEY and LIBRARY_IMAGE_SECRET_KEY environment variables are required");
        }
        return new Minio.Client({
          endPoint,
          port: parseInt(port, 10),
          accessKey,
          secretKey,
          useSSL: useSSL,
          region: "garage",
        });
      },
    },
  ],
  exports: [ImagesService],
})
export class ImagesModule { }
