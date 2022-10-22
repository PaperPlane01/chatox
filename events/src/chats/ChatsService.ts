import {Injectable} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {PrivateChat, PrivateChatDocument} from "./entities";
import {PrivateChatCreated} from "../common/types/events";
import {ChatParticipationService} from "../chat-participation";

@Injectable()
export class ChatsService {
    constructor(@InjectModel(PrivateChat.name) private readonly chatModel: Model<PrivateChatDocument>,
                private readonly chatParticipationService: ChatParticipationService) {
    }

    public async savePrivateChat(privateChatCreated: PrivateChatCreated): Promise<void> {
        const existingPrivateChat = await this.chatModel.findOne({id: privateChatCreated.id});

        if (existingPrivateChat) {
            return;
        }

        const privateChat = new this.chatModel({
            _id: privateChatCreated.id,
            id: privateChatCreated.id,
            chatParticipationsIds: privateChatCreated.chatParticipations.map(participant => participant.id),
            usersIds: privateChatCreated.chatParticipations.map(chatParticipant => chatParticipant.user.id)
        });
        await privateChat.save();
        await this.chatParticipationService.saveChatParticipations(privateChatCreated.chatParticipations);
    }

    public async findPrivateChatById(id: string): Promise<PrivateChat | null> {
        return this.chatModel.findOne({
            id
        });
    }
}
