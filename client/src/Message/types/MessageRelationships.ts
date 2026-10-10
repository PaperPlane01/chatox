import {Relationships} from "../../repository";
import {UserEntity} from "../../User/types";
import {Upload} from "../../api/types/response";
import {MessageEntity} from "./MessageEntity";
import {StickerEntity} from "../../Sticker/types";
import {ChatRoleEntity} from "../../ChatRole/types";

export interface MessageRelationships extends Relationships {
	users: UserEntity[],
	uploads: Upload<any>[],
	messages: MessageEntity[],
	stickers: StickerEntity[],
	chatRoles: ChatRoleEntity[]
}
