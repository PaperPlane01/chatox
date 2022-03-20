import {Schema} from "mongoose";

export const PrivateChatSchema = new Schema({
    _id: {
        type: String,
        index: {
            unique:
                true
        },
    },
    id: {
        type: String,
        index: {
            unique: true
        }
    },
    chatParticipationsIds: {
        type: [String]
    },
    usersIds: {
        type: [String]
    }
});
