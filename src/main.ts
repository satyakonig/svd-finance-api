import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import * as bodyParser from "body-parser";
import { configService } from "./config/config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ["log", "error", "warn"],
  });

  // Enable CORS for all origins
  app.enableCors({
    origin: "https://svd-finance-ui.onrender.com",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  app.use(bodyParser.json({ limit: "50mb" }));

  const types = require("pg").types;
  types.setTypeParser(20, function (val) {
    return parseInt(val);
  });

  await app.listen(configService.getPort());
}
bootstrap();
