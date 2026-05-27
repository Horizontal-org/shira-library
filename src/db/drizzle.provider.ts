import { FactoryProvider } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { drizzle, MySql2Database } from "drizzle-orm/mysql2";
import { createPool, Pool } from "mysql2/promise";
import { DRIZZLE } from "./drizzle.constants";
import * as schema from "./schema";

export const DrizzleProvider: FactoryProvider<MySql2Database<typeof schema>> = {
  provide: DRIZZLE,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    console.log("🚀 ~ configService:", configService.get('MYSQL_DATABASE'))
    const pool = createPool({
      host: configService.get('MYSQL_HOST'),
      port: Number(configService.get('MYSQL_PORT')) || 3306,
      user: configService.get('MYSQL_USER'),
      password: configService.get('MYSQL_PASSWORD'),
      database: configService.get('MYSQL_DATABASE'),
      connectionLimit: 10,
      charset: "utf8mb4",
    });

    return drizzle(pool, { schema, mode: "default" });
  },
};
