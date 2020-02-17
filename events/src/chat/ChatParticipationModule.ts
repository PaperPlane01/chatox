import {Module} from "@nestjs/common";
import {MongooseModule} from "@nestjs/mongoose";
import {ChatParticipationSchema} from "./schemas";
import {ChatParticipationService} from "./ChatParticipationService";

@Module({
    imports: [
        MongooseModule.forFeature([
            {name: "chatParticipation", schema: ChatParticipationSchema}
        ])
    ],
    providers: [ChatParticipationService],
    exports: [ChatParticipationService]
})
export class ChatParticipationModule {}
