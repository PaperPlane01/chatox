import {Document} from "mongoose";
import {ChatRole} from "./ChatRole";

export interface ChatParticipation extends Document {
    id: string,
    chatId: string,
    userId: string,
    role: ChatRole
}
