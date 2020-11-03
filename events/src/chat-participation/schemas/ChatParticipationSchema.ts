import {Schema} from "mongoose";

export const ChatParticipationSchema = new Schema({
    id: {
        type: String,
        index: true
    },
    chatId: {
        type: String,
        index: true
    },
    userId: {
        type: String,
        index: true
    },
    role: String,
    deleted: Boolean
});
