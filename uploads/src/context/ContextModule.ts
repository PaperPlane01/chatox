import {Module, Global} from "@nestjs/common";
import {CurrentUserHolder} from "./CurrentUserHolder";

@Global()
@Module({
    providers: [CurrentUserHolder],
    exports: [CurrentUserHolder]
})
export class ContextModule {}
