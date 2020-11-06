import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

export const getChatDeletionErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("chat.delete.error.server-unreachable");
    } else if (error.status === 404 && error.metadata && error.metadata.errorCode === "CHAT_DELETED") {
        return l("chat.delete.error.already-deleted");
    } else {
        return l("chat.delete.error.unknown", {errorStatus: error.status});
    }
};
