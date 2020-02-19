import {Document} from "mongoose";
import {ChatRole} from "./ChatRole";
import {User} from "../../common/types";

export interface ChatParticipation extends Document {
    id: string,
    chatId: string,
    userId: string,
    role: ChatRole
}
