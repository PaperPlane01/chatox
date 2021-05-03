import {Module} from '@nestjs/common';
import {UsersService} from './users.service';
import {AxiosModule} from "../axios/axios.module";
import {EurekaModule} from "../eureka/eureka.module";

@Module({
    providers: [UsersService],
    exports: [UsersService],
    imports: [AxiosModule, EurekaModule]
})
export class UsersModule {}
