import {CreateMessageRequest} from "./CreateMessageRequest";

export interface StartPrivateChatRequest {
    userId: string,
    message: CreateMessageRequest
}
