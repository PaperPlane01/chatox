import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import {ChatParticipationDto} from "../types";

const OBJECT_ID_LENGTH = 24;

@Schema()
export class ChatParticipation {
    @Prop({type: mongoose.Schema.Types.ObjectId})
    _id: string;

    @Prop({type: String})
    id: string;

    @Prop({type: String, index: true})
    chatId: string;

    @Prop({type: String, index: true})
    userId: string;

    @Prop({type: String, index: true})
    roleId: string;

    @Prop({type: Boolean})
    deleted: boolean;

    constructor(chatParticipationDto: ChatParticipationDto) {
        this._id = chatParticipationDto.id.length === OBJECT_ID_LENGTH
            ? new mongoose.Types.ObjectId(chatParticipationDto.id).toHexString()
            : new mongoose.Types.ObjectId().toHexString();
        this.id = chatParticipationDto.id;
        this.chatId = chatParticipationDto.chatId;
        this.userId = chatParticipationDto.user.id;
        this.roleId = chatParticipationDto.role.id;
        this.deleted = false;
    }
}

export type ChatParticipationDocument = ChatParticipation & Document;

export const ChatParticipationSchema = SchemaFactory.createForClass(ChatParticipation);