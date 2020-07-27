import {ChatOfCurrentUserEntity} from "../types";

export const canUpdateChat = (chat: ChatOfCurrentUserEntity) => {
    return chat.createdByCurrentUser;
};
