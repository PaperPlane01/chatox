import {ChatParticipation} from "./ChatParticipation";

export interface TransferChatOwnershipResponse {
    chatId: string,
    newOwner: ChatParticipation,
    oldOwer: ChatParticipation
}
