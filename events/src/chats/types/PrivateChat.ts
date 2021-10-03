import {Document} from "mongoose";

export interface PrivateChat extends Document {
    id: string,
    chatParticipationsIds: string[],
    usersIds: string[]
}
