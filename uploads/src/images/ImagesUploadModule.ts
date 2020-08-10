import {CacheModule, Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import redisStore from "cache-manager-redis-store";
import {ImagesUploadController} from "./ImagesUploadController";
import {ImagesUploadService} from "./ImagesUploadService";
import {uploadSchemaFactory} from "../mongoose/schemas";
import {UploadMapper} from "../common/mappers";
import {config} from "../config";

@Module({
    controllers: [ImagesUploadController],
    providers: [
        ImagesUploadService,
        {
            provide: UploadMapper,
            useValue: new UploadMapper()
        }
    ],
    imports: [
        MongooseModule.forFeatureAsync([
            uploadSchemaFactory
        ]),
        CacheModule.register({
            store: redisStore,
            host: config.REDIS_HOST,
            port: config.REDIS_PORT,
            ttl: Number.MAX_SAFE_INTEGER
        })
    ]
})
export class ImagesUploadModule {}
