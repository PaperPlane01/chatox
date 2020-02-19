import {Injectable} from "@nestjs/common";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {ChatParticipationService} from "./ChatParticipationService";
import {CreateChatParticipationDto} from "./types";
import {WebsocketEventsPublisher} from "../websocket";

@Injectable()
export class ChatParticipationController {
    constructor(private readonly chatParticipationService: ChatParticipationService,
                private readonly websocketEventsPublisher: WebsocketEventsPublisher) {}

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "user.joined.#",
        queue: `events_service_user_joined-${process.env.SERVER_PORT}`
    })
    public async onUserJoinedChat(createChatParticipationDto: CreateChatParticipationDto): Promise<void> {
        await this.chatParticipationService.saveChatParticipation(createChatParticipationDto);
        await this.websocketEventsPublisher.publishUserJoinedChat(createChatParticipationDto);
    }
}
