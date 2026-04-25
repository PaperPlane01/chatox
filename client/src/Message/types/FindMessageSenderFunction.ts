import {UserEntity} from "../../User";

export type FindMessageSenderFunction = (senderId: string) => UserEntity;
