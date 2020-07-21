import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {CreateEmailVerificationRequest, CheckEmailVerificationCodeValidityRequest} from "../types/request";
import {
    EmailVerificationResponse,
    EmailAvailabilityResponse,
    EmailVerificationCodeValidityResponse
} from "../types/response";
import {ACCOUNT, CODE, EMAIL, EMAIL_VERIFICATION, IS_AVAILABLE, IS_VALID, OAUTH} from "../endpoints";

export class EmailVerificationApi {
    public static createEmailVerification(createEmailVerificationRequest: CreateEmailVerificationRequest): AxiosPromise<EmailVerificationResponse> {
        return axiosInstance({
            method: "POST",
            url: `${process.env.REACT_APP_API_BASE_URL}/${OAUTH}/${EMAIL_VERIFICATION}`,
            data: createEmailVerificationRequest
        });
    }

    public static checkEmailAvailability(email: string): AxiosPromise<EmailAvailabilityResponse> {
        return axiosInstance({
            method: "GET",
            url: `${process.env.REACT_APP_API_BASE_URL}/${OAUTH}/${ACCOUNT}/${EMAIL}/${email}/${IS_AVAILABLE}`
        });
    }

    public static checkEmailVerificationCode(id: string, checkEmailVerificationCodeValidityRequest: CheckEmailVerificationCodeValidityRequest): AxiosPromise<EmailVerificationCodeValidityResponse> {
        return axiosInstance({
            method: "POST",
            url: `${process.env.REACT_APP_API_BASE_URL}/${OAUTH}/${EMAIL_VERIFICATION}/${id}/${CODE}/${IS_VALID}`,
            data: checkEmailVerificationCodeValidityRequest
        });
    }
}
