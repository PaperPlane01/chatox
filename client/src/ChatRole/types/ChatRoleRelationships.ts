import {Relationships} from "../../repository";
import {UserEntity} from "../../User";
import {Upload} from "../../api/types/response";

export interface ChatRoleRelationships extends Relationships {
	users: UserEntity[],
	uploads: Upload<any>[]
}
