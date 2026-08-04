import { Injectable } from "@nestjs/common"
import { Command, Console } from "nestjs-console"
import { ImagesService } from "./services/images.service"

@Console()
@Injectable()
export class ImagesCommand {
  constructor(private readonly service: ImagesService) { }

  @Command({ command: "test-minio-connection", description: "Check connectivity to the MinIO bucket" })
  async testMinioConnection() {
    try {
      const exists = await this.service.testConnection()
      if (exists) {
        console.log("MinIO connection OK — bucket exists and is reachable")
      } else {
        console.warn("MinIO connection OK, but the configured bucket does not exist")
      }
    } catch (e) {
      console.error("MinIO connection failed:", e)
      process.exitCode = 1
    }
    process.exit()
  }

  @Command({ command: "count-images", description: "Count the number of objects in the MinIO bucket" })
  async countImages() {
    try {
      const count = await this.service.countObjects()
      console.log(`Objects in bucket: ${count}`)
    } catch (e) {
      console.error("Failed to count objects:", e)
      process.exitCode = 1
    }
    process.exit()
  }
}
