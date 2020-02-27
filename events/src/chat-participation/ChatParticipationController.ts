import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {ChatParticipationService} from "./ChatParticipationService";
import {CreateChatParticipationDto} from "./types";

@Injectable()
export class ChatParticipationController {
    constructor(private readonly chatParticipationService: ChatParticipationService) {}

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "chat.user.joined.#",
        queue: `events_service_user_joined-${process.env.SERVER_PORT}`
    })
    public async onUserJoinedChat(createChatParticipationDto: CreateChatParticipationDto): Promise<void> {
        await this.chatParticipationService.saveChatParticipation(createChatParticipationDto);
    }
}
