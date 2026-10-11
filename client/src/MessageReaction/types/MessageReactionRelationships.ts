import {Relationships} from "../../repository";
import {UserEntity} from "../../User/types";
import {Upload} from "../../api/types/response";

export interface MessageReactionRelationships extends Relationships {
    users: UserEntity[],
    uploads: Upload<any>[]
}
