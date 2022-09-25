import {ChatRoleEntity} from "../types";
import {useStore} from "../../store";

export const useUserChatRole = (userId: string, chatId: string): ChatRoleEntity | undefined => {
    const {
        userChatRoles: {
            getRoleOfUserInChat
        }
    } = useStore();

    return getRoleOfUserInChat({userId, chatId});
};