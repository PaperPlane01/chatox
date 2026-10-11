import {UserEntity} from "../../User/types";

export type FindMessageSenderFunction = (senderId: string) => UserEntity;
