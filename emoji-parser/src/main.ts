import {config} from "dotenv";
config();

import {NestFactory} from "@nestjs/core";
import {ValidationPipe} from "@nestjs/common";
import allEmojiData from "@emoji-mart/data/sets/15/all.json";
import {init} from "emoji-mart";
import {AppModule} from "./AppModule";


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({transform: true}));
  await init({data: allEmojiData});
  await app.listen(process.env.TEXT_PARSER_PORT);
}

bootstrap();
