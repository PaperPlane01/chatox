import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {CreateEmailVerificationRequest, CheckEmailVerificationCodeValidityRequest} from "../types/request";
import {EmailVerificationResponse, EmailAvailabilityResponse} from "../types/response";
import {CODE, EMAIL, EMAIL_VERIFICATION, IS_AVAILABLE, IS_VALID, OAUTH} from "../endpoints";

export class EmailVerificationApi {
    public static createEmailVerification(createEmailVerificationRequest: CreateEmailVerificationRequest): AxiosPromise<EmailVerificationResponse> {
        return axiosInstance.post(`/${OAUTH}/${EMAIL_VERIFICATION}`, createEmailVerificationRequest);
    }

    public static checkEmailAvailability(email: string): AxiosPromise<EmailAvailabilityResponse> {
        return axiosInstance.get(`/${OAUTH}/${EMAIL}/${email}/${IS_AVAILABLE}`);
    }

    public static checkEmailVerificationCode(id: string, checkEmailVerificationCodeValidityRequest: CheckEmailVerificationCodeValidityRequest): AxiosPromise<EmailAvailabilityResponse> {
        return axiosInstance.post(`/${OAUTH}/${EMAIL_VERIFICATION}/${id}/${CODE}/${IS_VALID}`, checkEmailVerificationCodeValidityRequest);
    }
}
