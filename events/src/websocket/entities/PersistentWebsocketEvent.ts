import {Prop, Schema, SchemaFactory} from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import {Document} from "mongoose";
import {EventType, WebsocketEvent} from "../types";

@Schema()
export class PersistentWebsocketEvent<PayloadType = any> implements WebsocketEvent<PayloadType> {
    _id: mongoose.Types.ObjectId;

    @Prop({index: true})
    recipients: string[];

    @Prop({type: mongoose.Schema.Types.Mixed})
    payload: PayloadType;

    @Prop()
    type: EventType;

    @Prop({
        type: Date,
        expires: 900, //15 minutes
        default: Date.now
    })
    createdAt: Date;
}

export type PersistentWebsocketEventDocument<PayloadType = any> = Document & PersistentWebsocketEvent<PayloadType>;

export const PersistentWebsocketEventSchema = SchemaFactory.createForClass(PersistentWebsocketEvent);
