import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {CheckEmailConfirmationCodeValidityRequest, CreateEmailConfirmationCodeRequest} from "../types/request";
import {
    EmailAvailabilityResponse,
    EmailConfirmationCodeValidityResponse,
    EmailConfirmationCodeResponse
} from "../types/response";
import {ACCOUNT, EMAIL, EMAIL_CONFIRMATION_CODE, IS_AVAILABLE, IS_VALID, OAUTH} from "../endpoints";

export class EmailConfirmationCodeApi {
    public static createEmailConfirmationCode(createEmailVerificationRequest: CreateEmailConfirmationCodeRequest): AxiosPromise<EmailConfirmationCodeResponse> {
        return axiosInstance({
            method: "POST",
            url: `${process.env.REACT_APP_API_BASE_URL}/${OAUTH}/${EMAIL_CONFIRMATION_CODE}`,
            data: createEmailVerificationRequest
        });
    }

    public static checkEmailAvailability(email: string): AxiosPromise<EmailAvailabilityResponse> {
        return axiosInstance({
            method: "GET",
            url: `${process.env.REACT_APP_API_BASE_URL}/${OAUTH}/${ACCOUNT}/${EMAIL}/${email}/${IS_AVAILABLE}`
        });
    }

    public static checkEmailConfirmationCode(id: string, checkEmailConfirmationCodeValidityRequest: CheckEmailConfirmationCodeValidityRequest): AxiosPromise<EmailConfirmationCodeValidityResponse> {
        return axiosInstance({
            method: "POST",
            url: `${process.env.REACT_APP_API_BASE_URL}/${OAUTH}/${EMAIL_CONFIRMATION_CODE}/${id}/${IS_VALID}`,
            data: checkEmailConfirmationCodeValidityRequest
        });
    }
}
