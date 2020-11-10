import {validate as isValidEmail} from "email-validator";
import {isStringEmpty} from "../../utils/string-utils";
import {Labels} from "../../localization";

const USERNAME_REGEXP = /^[a-zA-Z0-9_.]+$/;
const SLUG_REGEXP = /^[a-zA-Z0-9_.]+$/;

export const validateUsername = (username: string): keyof Labels | undefined => {
    if (isStringEmpty(username)) {
        return "username.empty";
    }

    if (username.trim().length < 4) {
        return "username.too-short";
    }

    if (username.trim().length > 20) {
        return "username.too-long";
    }

    if (!USERNAME_REGEXP.test(username)) {
        return "username.contains-invalid-characters";
    }

    return undefined;
};

export const validatePassword = (password: string): keyof Labels| undefined => {
    if (isStringEmpty(password)) {
        return "password.empty";
    }

    if (password.trim().length < 5) {
        return "password.too-short";
    }

    if (password.trim().length > 40) {
        return "password.too-long";
    }

    return undefined;
};

export const validateRepeatedPassword = (repeatedPassword: string, originalPassword: string): keyof Labels | undefined => {
    if (repeatedPassword !== originalPassword) {
        return "password.do-not-match";
    }

    return undefined;
};

export const validateSlug = (slug: string | undefined): keyof Labels | undefined => {
    if (!isStringEmpty(slug)) {
        if (slug!.trim().length < 3) {
            return "slug.too-short";
        }

        if (slug!.trim().length > 30) {
            return "slug.too-long";
        }

        if (!SLUG_REGEXP.test(slug!)) {
            return "slug.contains-invalid-characters";
        }

        return undefined;
    }
};

export const validateFirstName = (firstName: string): keyof Labels | undefined => {
    if (isStringEmpty(firstName)) {
        return "firstName.empty";
    }

    if (firstName.trim().length < 2) {
        return "firstName.too-short";
    }

    if (firstName.trim().length > 20) {
        return "firstName.too-long";
    }

    return undefined;
};

export const validateLastName = (lastName: string | undefined): keyof Labels | undefined => {
    if (isStringEmpty(lastName)) {
        return undefined;
    }

    if (lastName!.trim().length < 2) {
        return "lastName.too-short";
    }

    if (lastName!.trim().length > 20) {
        return "lastName.too-long";
    }

    return undefined;
};

export const validateEmail = (email?: string): keyof Labels | undefined => {
    if (isStringEmpty(email)) {
        return "email.empty";
    }

    if (!isValidEmail(email!)) {
        return "email.invalid";
    }

    return undefined;
};

export const validateConfirmationCode = (verificationCode: string): keyof Labels | undefined => {
    if (isStringEmpty(verificationCode)) {
        return "email.verification.code.empty";
    }

    return undefined;
};
