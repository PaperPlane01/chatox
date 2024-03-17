import {config} from "dotenv";
config();

import {NestFactory} from "@nestjs/core";
import {AppModule} from "./AppModule";
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({transform: true}));
  await app.listen(process.env.TEXT_PARSER_PORT);
}

bootstrap();
