export interface MessageEntity {
    id: string,
    referredMessage?: string,
    sender: string,
    text: string,
    deleted: boolean,
    createdAt: Date,
    updatedAt?: Date,
    readByCurrentUser: boolean,
    previousMessageId?: string,
    nextMessageId?: string
}
