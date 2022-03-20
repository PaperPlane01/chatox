import {ChatMessage} from "../ChatMessage";
import {ChatParticipationDto} from "../../../chat-participation/types";

export interface PrivateChatCreated {
    id: string,
    chatParticipations: ChatParticipationDto[],
    message: ChatMessage
}
