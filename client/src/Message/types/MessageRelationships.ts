import {Relationships} from "../../repository";
import {UserEntity} from "../../User";
import {Upload} from "../../api/types/response";
import {MessageEntity} from "./MessageEntity";
import {StickerEntity} from "../../Sticker";
import {ChatRoleEntity} from "../../ChatRole/types";

export interface MessageRelationships extends Relationships {
	users: UserEntity[],
	uploads: Upload<any>[],
	messages: MessageEntity[],
	stickers: StickerEntity[],
	chatRoles: ChatRoleEntity[]
}
