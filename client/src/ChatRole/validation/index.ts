import {Labels} from "../../localization";
import {isStringEmpty} from "../../utils/string-utils";

const POSITIVE_AND_NEGATIVE_INTEGERS_REGEXP = /-?\d+/g;
const MIN_LEVEL = -1000;
const MAX_LEVEL = 1000;

export const validateFromLevel = (level?: string): keyof Labels | undefined => {
    if (!level) {
        return undefined;
    }

    if (!level.match(POSITIVE_AND_NEGATIVE_INTEGERS_REGEXP)) {
        return "chat-role.level.must-be-integer";
    }

    return undefined;
}

export const validateUpToLevel = (upToLevel?: string, fromLevel?: string): keyof Labels | undefined => {
    if (!upToLevel) {
        return undefined;
    }

    if (!upToLevel.match(POSITIVE_AND_NEGATIVE_INTEGERS_REGEXP)) {
        return "chat-role.level.must-be-integer";
    }

    if (!isNaN(Number(fromLevel))) {
        if (Number(upToLevel) <= Number(fromLevel)) {
            return "chat-role.level.up-to.must-be-greater-than-from";
        }
    }

    return undefined;
}

export const validateRoleName = (name: string): keyof Labels | undefined => {
    if (isStringEmpty(name, true)) {
        return "chat.role.name.cannot-be-empty";
    }

    if (name.length > 150) {
        return "chat.role.name.is-too-long";
    }

    return undefined;
}

export const validateRoleLevel = (level: string): keyof Labels | undefined => {
    if (isStringEmpty(level, true)) {
        return "chat.role.level.cannot-be-empty";
    }

    if (!level.match(POSITIVE_AND_NEGATIVE_INTEGERS_REGEXP)) {
        return "chat-role.level.must-be-integer";
    }

    const levelParsed = Number(level);

    if (levelParsed < MIN_LEVEL) {
        return "chat.role.level.is-too-low";
    }

    if (levelParsed > MAX_LEVEL) {
        return "chat.role.level.is-too-big";
    }

    return undefined;
}