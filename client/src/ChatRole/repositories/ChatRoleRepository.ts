import {ChatRoleEntity, ChatRoleRelationships} from "../types";
import {Repository} from "../../repository";

export interface ChatRoleRepository extends Repository<ChatRoleEntity, ChatRoleRelationships> {
	findByChatId(chatId: string): Promise<ChatRoleEntity[]>
}
