import {Labels, TranslationFunction} from "../../localization";
import {isStandardChatRole} from "../../api/types/response";

export const getChatRoleTranslation = (chatRoleName: string, l: TranslationFunction): string => {
    if (!isStandardChatRole(chatRoleName)) {
        return chatRoleName;
    }

    return l(`chat.participant.role.${chatRoleName}` as keyof Labels);
}