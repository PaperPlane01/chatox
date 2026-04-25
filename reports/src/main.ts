import {NestFactory} from "@nestjs/core";
import {config as loadConfig} from "dotenv";

loadConfig();

import {NestExpressApplication} from "@nestjs/platform-express";
import {AppModule} from "./app.module";
import {config} from "./config/env.config";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("/api/v1");
  app.set("query parser", "extended");
  await app.listen(config.REPORTS_SERVICE_PORT);
}
bootstrap();
