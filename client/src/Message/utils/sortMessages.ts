import {MessageEntity} from "../types";

export const sortMessages = (leftMessageId: string, rightMessageId: string, findMessage: (messageId: string) => MessageEntity, reverse: boolean): number => {
    const leftMessage = findMessage(leftMessageId);
    const rightMessage = findMessage(rightMessageId);

    if (reverse) {
        return rightMessage.createdAt.getTime() - leftMessage.createdAt.getTime();
    } else {
        return leftMessage.createdAt.getTime() - rightMessage.createdAt.getTime();
    }
}

export const createSortMessages = (findMessage: (id: string) => MessageEntity, reverse: boolean) => (leftMessageId: string, rightMessageId: string) => sortMessages(leftMessageId, rightMessageId, findMessage, reverse);
