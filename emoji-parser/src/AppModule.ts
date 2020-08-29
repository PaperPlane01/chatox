import {Module} from "@nestjs/common";
import {EmojiParserModule} from "./emoji-parser";
import {EurekaModule} from "./eureka";

@Module({
    imports: [EmojiParserModule, EurekaModule]
})
export class AppModule {}
