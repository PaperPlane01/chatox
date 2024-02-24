import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {CheckEmailConfirmationCodeValidityRequest, CreateEmailConfirmationCodeRequest} from "../types/request";
import {
    EmailAvailabilityResponse,
    EmailConfirmationCodeValidityResponse,
    EmailConfirmationCodeResponse
} from "../types/response";
import {ACCOUNTS, EMAIL, EMAIL_CONFIRMATION_CODES, IS_AVAILABLE, IS_VALID, OAUTH} from "../endpoints";

export class EmailConfirmationCodeApi {
    public static createEmailConfirmationCode(createEmailVerificationRequest: CreateEmailConfirmationCodeRequest): AxiosPromise<EmailConfirmationCodeResponse> {
        return axiosInstance({
            method: "POST",
            url: `${import.meta.env.VITE_API_BASE_URL}/${OAUTH}/${EMAIL_CONFIRMATION_CODES}`,
            data: createEmailVerificationRequest
        });
    }

    public static checkEmailAvailability(email: string): AxiosPromise<EmailAvailabilityResponse> {
        return axiosInstance({
            method: "GET",
            url: `${import.meta.env.VITE_API_BASE_URL}/${OAUTH}/${ACCOUNTS}/${EMAIL}/${email}/${IS_AVAILABLE}`
        });
    }

    public static checkEmailConfirmationCode(id: string, checkEmailConfirmationCodeValidityRequest: CheckEmailConfirmationCodeValidityRequest): AxiosPromise<EmailConfirmationCodeValidityResponse> {
        return axiosInstance({
            method: "POST",
            url: `${import.meta.env.VITE_API_BASE_URL}/${OAUTH}/${EMAIL_CONFIRMATION_CODES}/${id}/${IS_VALID}`,
            data: checkEmailConfirmationCodeValidityRequest
        });
    }
}
