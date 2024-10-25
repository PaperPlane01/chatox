import {MessageEntity, MessageRelationships} from "../types";
import {Repository} from "../../repository";

export interface DraftMessageRepository extends Repository<MessageEntity, MessageRelationships> {
	findByChatId(chatId: string): Promise<MessageEntity | undefined>,
	deleteById(id: string): Promise<void>,
	findAll(): Promise<MessageEntity[]>
	findByChatIdIn(chatIds: string[]): Promise<MessageEntity[]>
}
