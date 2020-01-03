import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {ACCOUNT, IS_AVAILABLE, ME, OAUTH, REGISTRATION, REVOKE, SLUG, TOKEN, USER, USERNAME} from "../endpoints";
import {RegistrationRequest, RevokeTokenRequest} from "../types/request";
import {AvailabilityResponse, CurrentUser, OAuth2Response, RegistrationResponse} from "../types/response";

export class UserApi {
    public static registerUser(registrationRequest: RegistrationRequest): AxiosPromise<RegistrationResponse> {
        return axiosInstance.post(`/${REGISTRATION}`, registrationRequest);
    }

    public static isUsernameAvailable(username: string): AxiosPromise<AvailabilityResponse> {
        return axiosInstance({
            method: "GET",
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/${OAUTH}/${ACCOUNT}/${USERNAME}/${username}/${IS_AVAILABLE}`,
            headers: {
                Accept: "application/json"
            }
        })
    }

    public static isSlugAvailable(slug: string): AxiosPromise<AvailabilityResponse> {
        return axiosInstance.get(`/${USER}/${SLUG}/${slug}/${IS_AVAILABLE}`);
    }

    public static getCurrentUser(): AxiosPromise<CurrentUser> {
        return axiosInstance.get(`/${USER}/${ME}`);
    }

    public static doLogin(username: string, password: string): AxiosPromise<OAuth2Response> {
        return axiosInstance({
            method: "POST",
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/${OAUTH}/${TOKEN}`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json"
            },
            data: stringify({
                grant_type: "password",
                client_id: process.env.REACT_APP_CLIENT_ID,
                client_secret: process.env.REACT_APP_CLIENT_SECRET,
                username,
                password
            })
        })
    }

    public static revokeToken(revokeTokenRequest: RevokeTokenRequest): AxiosPromise<void> {
        return axiosInstance({
            method: "DELETE",
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/${OAUTH}/${TOKEN}/${REVOKE}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            }
        })
    }
}