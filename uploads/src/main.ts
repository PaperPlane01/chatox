import {config as loadConfig} from "dotenv";

loadConfig();

import {NestFactory} from "@nestjs/core";
import {AppModule} from "./AppModule";
import {config} from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(config.PORT);
}

bootstrap();
