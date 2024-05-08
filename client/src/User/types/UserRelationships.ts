import {Relationships} from "../../repository";
import {Upload} from "../../api/types/response";

export interface UserRelationships extends Relationships {
	uploads: Upload<any>[]
}
