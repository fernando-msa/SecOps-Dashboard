import "reflect-metadata";
import { DataSource } from "typeorm";

export default new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST || "localhost",
  port: Number(process.env.DATABASE_PORT || 5432),
  username: process.env.DATABASE_USER || "secops",
  password: process.env.DATABASE_PASSWORD || "secops_secret",
  database: process.env.DATABASE_NAME || "secops_db",
  synchronize: false,
  logging: process.env.TYPEORM_LOGGING === "true",
  entities: [__dirname + "/**/*.entity.js"],
  migrations: [__dirname + "/migrations/*.js"],
});
