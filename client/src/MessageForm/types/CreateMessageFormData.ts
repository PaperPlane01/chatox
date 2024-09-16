import {MessageFormData} from "./MessageFormData";

export interface CreateMessageFormData extends MessageFormData {
    referredMessageId?: string,
    scheduledAt?: Date
}
