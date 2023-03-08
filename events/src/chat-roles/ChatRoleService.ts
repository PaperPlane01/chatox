import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {ChatRole, ChatRoleDocument} from "./entities";
import {Model, Schema} from "mongoose";
import {ChatFeatures, ChatRoleResponse} from "./types";

@Injectable()
export class ChatRoleService {
    constructor(@InjectModel(ChatRole.name) private readonly chatRoleModel: Model<ChatRoleDocument>) {
    }

    public async saveChatRole(chatRoleResponse: ChatRoleResponse): Promise<void> {
        const existingChatRole = await this.chatRoleModel.findOne({
            _id: chatRoleResponse.id
        });

        if (!existingChatRole) {
            console.log(`No role found with id ${chatRoleResponse.id}`)
            const chatRole = new ChatRole(chatRoleResponse);
            await new this.chatRoleModel(chatRole).save();
        } else {
            const chatRole = await this.chatRoleModel.findOne({
                id: chatRoleResponse.id
            })
            chatRole.name = chatRoleResponse.name;
            chatRole.level = chatRoleResponse.level;
            chatRole.default = chatRoleResponse.default;
            chatRole.features = chatRoleResponse.features;

            await chatRole.save();
        }
    }

    public async findRolesWithEnabledFeatures(chatId: string, features: Array<keyof ChatFeatures>): Promise<ChatRole[]> {
        const featureQueries = {};

        features.forEach(feature => featureQueries[`${feature}.enabled`] = true);

        return this.chatRoleModel.find({
            chatId,
            ...featureQueries
        });
    }
}