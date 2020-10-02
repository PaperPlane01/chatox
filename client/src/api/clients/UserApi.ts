import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {
    ACCOUNTS,
    IS_AVAILABLE,
    ME,
    OAUTH,
    PASSWORD,
    RECOVERY,
    REGISTRATION,
    REVOKE,
    SLUG,
    TOKEN,
    USERS,
    USERNAME,
    ANONYMOUS
} from "../endpoints";
import {
    AnonymousUserRegistrationRequest,
    RecoverPasswordRequest,
    RegistrationRequest,
    RevokeTokenRequest,
    UpdatePasswordRequest,
    UpdateUserRequest
} from "../types/request";
import {AvailabilityResponse, CurrentUser, OAuth2Response, RegistrationResponse, User} from "../types/response";

export class UserApi {
    public static registerUser(registrationRequest: RegistrationRequest): AxiosPromise<RegistrationResponse> {
        return axiosInstance.post(`/${REGISTRATION}`, registrationRequest);
    }

    public static registerAnonymousUser(anonymousUserRegistrationRequest: AnonymousUserRegistrationRequest): AxiosPromise<RegistrationResponse> {
        return axiosInstance.post(`/${REGISTRATION}/${ANONYMOUS}`, anonymousUserRegistrationRequest);
    }

    public static isUsernameAvailable(username: string): AxiosPromise<AvailabilityResponse> {
        return axiosInstance({
            method: "GET",
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/${OAUTH}/${ACCOUNTS}/${USERNAME}/${username}/${IS_AVAILABLE}`,
            headers: {
                Accept: "application/json"
            }
        })
    }

    public static isSlugAvailable(slug: string): AxiosPromise<AvailabilityResponse> {
        return axiosInstance.get(`/${USERS}/${SLUG}/${slug}/${IS_AVAILABLE}`);
    }

    public static getCurrentUser(): AxiosPromise<CurrentUser> {
        return axiosInstance.get(`/${USERS}/${ME}`);
    }

    public static getUserByIdOrSlug(idOrSlug: string): AxiosPromise<User> {
        return axiosInstance.get(`/${USERS}/${idOrSlug}`);
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
            },
            data: {
                ...revokeTokenRequest
            }
        })
    }

    public static updateUser(id: string, updateUserRequest: UpdateUserRequest): AxiosPromise<User> {
        return axiosInstance.put(`/${USERS}/${id}`, updateUserRequest);
    }

    public static updatePassword(updatePasswordRequest: UpdatePasswordRequest): AxiosPromise<void> {
        return axiosInstance({
            method: "PUT",
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/${OAUTH}/${ACCOUNTS}/${PASSWORD}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            data: {
                ...updatePasswordRequest
            }
        });
    }

    public static recoverPassword(recoverPasswordRequest: RecoverPasswordRequest): AxiosPromise<void> {
        return axiosInstance({
            method: "PUT",
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/${OAUTH}/${ACCOUNTS}/${PASSWORD}/${RECOVERY}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            data: {
                ...recoverPasswordRequest
            }
        });
    }
}
