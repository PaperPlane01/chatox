import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {ChatParticipation, ChatParticipationDocument} from "./entities";
import {ChatParticipationDto} from "./types";
import {ChatFeatures, ChatRoleService} from "../chat-roles";

@Injectable()
export class ChatParticipationService {
    constructor(@InjectModel(ChatParticipation.name) private readonly chatParticipationModel: Model<ChatParticipationDocument>,
                private readonly chatRoleService: ChatRoleService) {

    }

    public async saveChatParticipations(chatParticipations: ChatParticipationDto[]): Promise<void> {
        for (const chatParticipation of chatParticipations) {
            await this.saveChatParticipation(chatParticipation);
        }
    }

    public async saveChatParticipation(chatParticipationDto: ChatParticipationDto): Promise<void> {
        const existingChatParticipation = await this.chatParticipationModel.findOne({
            id: chatParticipationDto.id
        });

        if (existingChatParticipation) {
            existingChatParticipation.roleId = chatParticipationDto.role.id;
            await existingChatParticipation.save();
        } else {
            const chatParticipation = new ChatParticipation(chatParticipationDto);
            await new this.chatParticipationModel(chatParticipation).save();
        }
    }

    public async deleteChatParticipation(id: string): Promise<void> {
        const chatParticipation = await this.chatParticipationModel.findOne({id});

        if (chatParticipation) {
            chatParticipation.deleted = true;
            await chatParticipation.save();
        }
    }

    public async findChatParticipationById(id: string): Promise<ChatParticipation> {
        return this.chatParticipationModel.findOne({id});
    }

    public async findByChatId(chatId: string): Promise<ChatParticipation[]> {
        return this.chatParticipationModel.find({
            chatId,
            deleted: false
        });
    }

    public async findByUserId(userId: string): Promise<ChatParticipation[]> {
        return this.chatParticipationModel.find({
            userId
        });
    }

    public async findChatParticipationsWithEnabledFeatures(chatId: string, features: Array<keyof ChatFeatures>): Promise<ChatParticipation[]> {
        const chatRoles = await this.chatRoleService.findRolesWithEnabledFeatures(chatId, features);
        const chatRolesIds = chatRoles.map(chatRole => chatRole._id.toHexString());

        return this.chatParticipationModel.find({
            chatId,
            roleId: {
                $in: chatRolesIds
            }
        });
    }
}
