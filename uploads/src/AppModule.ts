import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ImagesUploadModule} from "./images";
import {config} from "./config";
import {UploadsModule} from "./uploads";
import {EurekaModule} from "./eureka";

@Module({
  imports: [
      ImagesUploadModule,
      UploadsModule,
      EurekaModule,
      MongooseModule.forRoot(`mongodb://${config.MONGODB_HOST}:${config.MONGODB_PORT}/${config.MONGODB_DATABASE_NAME}`)
  ]
})
export class AppModule {}
