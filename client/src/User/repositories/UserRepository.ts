import {Repository} from "../../repository";
import {UserEntity, UserRelationships} from "../types";

export interface UserRepository extends Repository<UserEntity, UserRelationships> {

}