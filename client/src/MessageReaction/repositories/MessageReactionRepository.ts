import {Repository} from "../../repository";
import {MessageReactionEntity, MessageReactionRelationships} from "../types";

export interface MessageReactionRepository extends Repository<MessageReactionEntity, MessageReactionRelationships> {
    findByMessageId(messageId: string): Promise<MessageReactionEntity[]>
    findByMessageIdAndEmojiId(messageId: string, emojiId: string): Promise<MessageReactionEntity[]>
    findByMessageIdAndCreatedAtBetween(messageId: string, createdAtStart: Date, createdAtEnd: Date): Promise<MessageReactionEntity[]>
    findByMessageIdAndCreatedAtAfter(messageId: string, date: Date): Promise<MessageReactionEntity[]>
    findByMessageIdAndEmojiIdAndCreatedAtBetween(
        messageId: string,
        emojiId: string,
        createdAtStart: Date,
        createdAtEnd: Date
    ): Promise<MessageReactionEntity[]>
    findByMessageIdAndEmojiIdAndCreatedAtAfter(
        messageId: string,
        emojiId: string,
        date: Date
    ): Promise<MessageReactionEntity[]>
}
