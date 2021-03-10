export interface CreateMessageRequest {
    text: string,
    referredMessageId?: string,
    uploadAttachments: string[],
    scheduledAt?: string
}
