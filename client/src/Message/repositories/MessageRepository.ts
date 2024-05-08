import {Repository} from "../../repository";
import {MessageEntity, MessageRelationships} from "../types";

export interface MessageRepository extends Repository<MessageEntity, MessageRelationships>{
	findByChatId(chatId: string): Promise<MessageEntity[]>,
	findByChatIdAndCreatedAtBetween(
		chatId: string,
		createdAtBefore: Date,
		createdAtAfter: Date
	): Promise<MessageEntity[]>
}