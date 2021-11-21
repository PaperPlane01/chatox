import {config} from "dotenv";

config();

import {NestFactory} from "@nestjs/core";
import {AppModule} from "./AppModule";
import {getEnabledLogLevels} from "./logging/utils";
import {config as envConfig} from "./env-config";

async function bootstrap() {
  console.log(`Mongo host is ${envConfig.MONGODB_HOST}`)
  const app = await NestFactory.create(AppModule, {
    logger: getEnabledLogLevels(envConfig)
  });
  await app.listen(envConfig.EVENTS_SERVICE_PORT);
}

bootstrap();
