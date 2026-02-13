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
    origin: (origin, callback) => {
      const allowedOrigins = ["https://svd-finance-ui.onrender.com"];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  });

  app.use(bodyParser.json({ limit: "50mb" }));

  const types = require("pg").types;
  types.setTypeParser(20, function (val) {
    return parseInt(val);
  });

  await app.listen(configService.getPort());
}
bootstrap();
