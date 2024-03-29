import {Labels} from "../../localization";
import {isStringEmpty} from "../../utils/string-utils";
import {ChatDeletionReason, TimeUnit} from "../../api/types/response";
import {isDefined} from "../../utils/object-utils";

const SLUG_REGEXP = /^[a-zA-Z0-9_.]+$/;

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

export const validateChatTags = (tags: string[]): keyof Labels | undefined => {
    if (tags.length > 15) {
        return "chat.tags.too-many";
    }

    return undefined;
};

export const validateChatSlug = (slug?: string): keyof Labels | undefined => {
    if (isStringEmpty(slug)) {
        return;
    }

    if (!SLUG_REGEXP.test(slug!)) {
        return "chat.slug.contains-invalid-characters";
    }

    if (slug!.length > 25) {
        return "chat.slug.too-long";
    }

    return undefined;
};

export const validateChatSlowModeInterval = (interval: string | undefined, acceptEmpty: boolean): keyof Labels | undefined => {
    if (isStringEmpty(interval)) {
       if (acceptEmpty) {
           return undefined;
       } else {
           return "common.validation.error.required";
       }
    }

    const intervalNumber = Number(interval);

    if (isNaN(intervalNumber) || !Number.isInteger(interval)) {
        return "common.validation.error.must-be-integer";
    }

    if (intervalNumber < 1) {
        return "common.validation.error.must-be-positive";
    }

    return undefined;
};

export const validateChatSlowModeTimeUnit = (timeUnit: TimeUnit | undefined, acceptEmpty: boolean): keyof Labels | undefined => {
    if (!isDefined(timeUnit) && !acceptEmpty) {
        return "common.validation.error.required";
    }

    return undefined;
};

export const validateChatDeletionComment = (comment: string | undefined, chatDeletionReason: ChatDeletionReason): keyof Labels | undefined => {
    if (isStringEmpty(comment)) {
        if (chatDeletionReason === ChatDeletionReason.OTHER) {
            return "chat.delete.comment-required-if-reason-is-other";
        }

        return undefined;
    }

    if (comment!.length > 1000) {
        return "chat.delete.comment-is-too-long";
    }

    return undefined;
};