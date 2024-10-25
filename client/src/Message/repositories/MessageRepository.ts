import {MessageEntity, MessageRelationships} from "../types";
import {Repository} from "../../repository";

export interface MessageRepository extends Repository<MessageEntity, MessageRelationships> {
	findByChatId(chatId: string): Promise<MessageEntity[]>,
	findByChatIdAndCreatedAtBetween(
		chatId: string,
		createdAtBefore: Date,
		createdAtAfter: Date
	): Promise<MessageEntity[]>
}