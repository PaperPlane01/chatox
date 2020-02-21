import {Labels} from "../../localization/types";
import {isStringEmpty} from "../../utils/string-utils";

export const validateChatName = (name?: string): keyof Labels | undefined => {
    if (isStringEmpty(name)) {
        return "chat.name.empty";
    }

    if (name!.length > 30) {
        return "chat.name.too-long";
    }

    return undefined;
};

export const validateChatDescription = (description?: string): keyof Labels | undefined => {
    if (isStringEmpty(description)) {
        return undefined;
    }

    if (description!.length > 1000) {
        return "chat.description.too-long";
    }

    return undefined;
};

export const validateChatTag = (tag?: string): keyof Labels | undefined => {
    if (isStringEmpty(tag)) {
        return undefined;
    }

    if (tag!.length > 15) {
        return "chat.tag.too-long";
    }

    return undefined;
};

export const validateTags = (tags: string[]): keyof Labels | undefined => {
    if (tags.length > 15) {
        return "chat.tags.too-many";
    }

    return undefined;
};
