import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {ChatParticipation, ChatParticipationDto, ChatRole} from "./types";

@Injectable()
export class ChatParticipationService {
    constructor(@InjectModel("chatParticipation") private readonly chatParticipationModel: Model<ChatParticipation>) {}

    public async saveChatParticipations(chatParticipations: ChatParticipationDto[]): Promise<void> {
        for (const chatParticipation of chatParticipations) {
            await this.saveChatParticipation(chatParticipation);
        }
    }

    public async saveChatParticipation(createChatParticipationDto: ChatParticipationDto): Promise<void> {
        const chatParticipation = new this.chatParticipationModel({
            id: createChatParticipationDto.id,
            chatId: createChatParticipationDto.chatId,
            role: createChatParticipationDto.role,
            userId: createChatParticipationDto.user.id,
            deleted: false
        });
        await chatParticipation.save();
    }

    public async deleteChatParticipation(id: string): Promise<void> {
        const chatParticipation = await this.chatParticipationModel.findOne({id}).exec();

        if (chatParticipation) {
            chatParticipation.deleted = true;
            await chatParticipation.save();
        }
    }

    public findChatParticipationById(id: string): Promise<ChatParticipation> {
        return this.chatParticipationModel.findOne({id}).exec();
    }

    public async findByChatId(chatId: string): Promise<ChatParticipation[]> {
        return this.chatParticipationModel.find({
            chatId,
            deleted: false
        })
            .exec();
    }

    public async findAdminsByChatId(chatId: string): Promise<ChatParticipation[]> {
        return this.chatParticipationModel.find({
            chatId,
            deleted: false,
            role: ChatRole.ADMIN
        })
            .exec();
    }

    public async findByUserId(userId: string): Promise<ChatParticipation[]> {
        return this.chatParticipationModel.find({
            userId
        })
            .exec();
    }
}
