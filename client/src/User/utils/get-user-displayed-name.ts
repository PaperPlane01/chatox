import {isStringEmpty} from "../../utils/string-utils";

export const getUserDisplayedName = (user: {firstName: string, lastName?: string}): string => {
    if (isStringEmpty(user.lastName)) {
        return `${user.firstName}`;
    } else {
        return `${user.firstName} ${user.lastName}`;
    }
};
