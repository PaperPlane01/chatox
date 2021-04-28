import {Module} from '@nestjs/common';
import {ChatsService} from "./chats.service";
import {AxiosModule} from "../axios/axios.module";
import {EurekaModule} from "../eureka/eureka.module";

@Module({
    providers: [ChatsService],
    imports: [AxiosModule, EurekaModule],
    exports: [ChatsService]
})
export class ChatsModule {}
