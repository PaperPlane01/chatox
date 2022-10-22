import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import {Document} from "mongoose";

@Schema()
export class PrivateChat {
    @Prop()
    _id: string;

    @Prop()
    chatParticipationsIds: string[];

    @Prop()
    usersIds: string[];
}

export type PrivateChatDocument = Document & PrivateChat;

export const PrivateChatSchema = SchemaFactory.createForClass(PrivateChat);