import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ScheduleModule} from "@nestjs/schedule";
import {CacheModule} from "@nestjs/cache-manager";
import * as redisStore from "cache-manager-redis-store";
import {ImagesUploadModule} from "./images";
import {config} from "./config";
import {UploadsModule} from "./uploads";
import {EurekaModule} from "./eureka";
import {VideosUploadModule} from "./videos";
import {AudiosUploadModule} from "./audios";
import {FilesModule} from "./files";
import {AuthModule} from "./auth";
import {RabbitMQConfigModule} from "./rabbitmq";
import {FfmpegModule} from "./ffmpeg";
import {UploadReferenceModule} from "./upload-references";

@Module({
  imports: [
      ImagesUploadModule,
      UploadsModule,
      EurekaModule,
      VideosUploadModule,
      AudiosUploadModule,
      FilesModule,
      AuthModule,
      RabbitMQConfigModule,
      FfmpegModule,
      UploadReferenceModule,
      CacheModule.register({
          store: redisStore,
          host: config.REDIS_HOST,
          port: config.REDIS_PORT,
          ttl: Number.MAX_SAFE_INTEGER,
          isGlobal: true
      }),
      MongooseModule.forRoot(`mongodb://${config.MONGODB_HOST}:${config.MONGODB_PORT}/${config.MONGODB_DATABASE_NAME}`),
      ScheduleModule.forRoot()
  ]
})
export class AppModule {}
