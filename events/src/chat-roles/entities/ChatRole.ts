import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import {ChatFeatures, ChatRoleResponse} from "../types";

@Schema()
export class ChatRole {
    @Prop({type: mongoose.Schema.Types.ObjectId})
    _id: mongoose.Types.ObjectId;

    @Prop()
    name: string;

    @Prop()
    level: number;

    @Prop({index: true})
    chatId: string;

    @Prop()
    default: boolean;

    @Prop({type: mongoose.Schema.Types.Mixed})
    features: ChatFeatures;

    constructor(chatRole: ChatRoleResponse) {
        this._id = new mongoose.Types.ObjectId(chatRole.id);
        this.chatId = chatRole.chatId;
        this.name = chatRole.name;
        this.level = chatRole.level;
        this.default = chatRole.default;
        this.features = chatRole.features;
    }
}

export type ChatRoleDocument = mongoose.Document & ChatRole;

export const ChatRoleSchema = SchemaFactory.createForClass(ChatRole);