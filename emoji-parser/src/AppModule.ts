import {Module} from "@nestjs/common";
import {EurekaModule} from "./eureka";
import {EmojiModule} from "./emoji";
import {TextParserModule} from "./text-parser";

@Module({
    imports: [EmojiModule, TextParserModule, EurekaModule]
})
export class AppModule {

}
