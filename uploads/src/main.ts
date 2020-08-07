import {config as loadConfig} from "dotenv";

loadConfig();

import {NestFactory} from "@nestjs/core";
import {ValidationPipe} from "@nestjs/common";
import {AppModule} from "./AppModule";
import {config} from "./config";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({transform: true}));
  await app.listen(config.PORT);
}

bootstrap();
