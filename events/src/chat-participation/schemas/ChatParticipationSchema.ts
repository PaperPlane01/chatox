import {Schema} from "mongoose";

export const ChatParticipationSchema = new Schema({
    id: String,
    chatId: String,
    userId: String,
    role: String,
    deleted: Boolean
});
