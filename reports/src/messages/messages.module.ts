import {Module} from "@nestjs/common";
import {MessagesService} from "./messages.service";
import {EurekaModule} from "../eureka/eureka.module";
import {AxiosModule} from "../axios/axios.module";

@Module({
  providers: [MessagesService],
  imports: [AxiosModule, EurekaModule],
  exports: [MessagesService]
})
export class MessagesModule {}
