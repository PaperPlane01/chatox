import { NestFactory } from "@nestjs/core";
import {config as loadConfig} from "dotenv";

loadConfig();

import {AppModule} from "./app.module";
import {config} from "./config/env.config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix("/api/v1");
  await app.listen(config.REPORTS_SERVICE_PORT);
}
bootstrap();
