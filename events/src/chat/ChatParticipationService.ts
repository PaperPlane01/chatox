import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {RabbitSubscribe} from "@nestjs-plus/rabbitmq";
import {Model} from "mongoose";
import {ChatParticipation, CreateChatParticipationDto} from "./types";

@Injectable()
export class ChatParticipationService {
    constructor(@InjectModel("chatParticipation") private readonly chatParticipationModel: Model<ChatParticipation>) {}

    @RabbitSubscribe({
        exchange: "chat.events",
        routingKey: "user.joined.#",
        queue: "events_service_user_joined"
    })
    public async saveChatParticipation(createChatParticipationDto: CreateChatParticipationDto): Promise<void> {
        const chatParticipation = new this.chatParticipationModel({
            id: createChatParticipationDto.id,
            chatId: createChatParticipationDto.chatId,
            role: createChatParticipationDto.role,
            userId: createChatParticipationDto.user.id
        });
        await chatParticipation.save();
    }

    public async findByChatId(chatId: string): Promise<ChatParticipation[]> {
        return this.chatParticipationModel.find({
            chatId
        })
            .exec()
    }
}
