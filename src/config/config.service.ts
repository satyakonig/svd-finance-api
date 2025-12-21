import { TypeOrmModuleOptions } from "@nestjs/typeorm";

require("dotenv").config();

class ConfigService {
  constructor(private env: { [k: string]: string | undefined }) {}

  private getValue(key: string, throwOnMissing = true): string {
    const value = this.env[key];
    if (!value && throwOnMissing) {
      throw new Error(`config error - missing env.${key}`);
    }

    return value;
  }

  public ensureValues(keys: string[]) {
    keys.forEach((k) => this.getValue(k, true));
    return this;
  }

  public getPort() {
    return this.getValue("PORT", true);
  }

  public getJwtSecret() {
    return this.getValue("JWT_SECRET", true);
  }

  public isProduction() {
    const mode = this.getValue("MODE", false);
    return mode != "DEV";
  }

  public getTypeOrmConfig(): TypeOrmModuleOptions {
    console.log("Tables are in sync");

    return {
      type: "postgres",
      host: this.getValue("DB_HOST"),
      port: parseInt(this.getValue("DB_PORT")),
      username: this.getValue("DB_USER"),
      password: this.getValue("DB_PASSWORD"),
      database: this.getValue("DB_DATABASE"),
      schema: this.getValue("DB_SCHEMA"),
      synchronize: false,
      autoLoadEntities: true,
      ssl: this.isProduction(),
    };
  }
}

const configService = new ConfigService(process.env).ensureValues([
  "DB_HOST",
  "DB_PORT",
  "DB_USER",
  "DB_PASSWORD",
  "DB_DATABASE",
  "DB_SCHEMA",
  "PORT",
  "JWT_SECRET",
]);

export { configService };
