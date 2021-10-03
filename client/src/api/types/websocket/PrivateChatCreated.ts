import {ChatParticipation, Message} from "../response";

export interface PrivateChatCreated {
    id: string,
    chatParticipations: ChatParticipation[],
    message: Message
}
