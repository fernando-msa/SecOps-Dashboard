import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigService } from "@nestjs/config";

export const databaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: "postgres",
  host: configService.get("DATABASE_HOST", "localhost"),
  port: configService.get<number>("DATABASE_PORT", 5432),
  username: configService.get("DATABASE_USER", "secops"),
  password: configService.get("DATABASE_PASSWORD", "secops_secret"),
  database: configService.get("DATABASE_NAME", "secops_db"),
  autoLoadEntities: true,
  synchronize: true,
});
