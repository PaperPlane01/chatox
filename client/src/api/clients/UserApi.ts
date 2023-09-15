import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {
    ACCOUNTS,
    ANONYMOUS,
    EMAIL,
    GOOGLE,
    IS_AVAILABLE,
    ME,
    OAUTH,
    PASSWORD, PHOTOS,
    RECOVERY,
    REGISTRATION,
    REVOKE,
    SLUG,
    TOKEN,
    USERNAME,
    USERS
} from "../endpoints";
import {
    AnonymousUserRegistrationRequest, CreateUserProfilePhotoRequest,
    GoogleRegistrationRequest,
    RecoverPasswordRequest,
    RegistrationRequest,
    RevokeTokenRequest,
    UpdateEmailRequest,
    UpdatePasswordRequest,
    UpdateUserRequest
} from "../types/request";
import {
    AvailabilityResponse,
    CurrentUser,
    OAuth2Response,
    RegistrationResponse,
    User,
    UserProfilePhoto
} from "../types/response";

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

    public static updateEmail(updateEmailRequest: UpdateEmailRequest): AxiosPromise<void> {
        return axiosInstance({
            method: "PUT",
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/${OAUTH}/${ACCOUNTS}/${EMAIL}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
            },
            data: {
                ...updateEmailRequest
            }
        });
    }

    public static checkEmailAvailability(email: string): AxiosPromise<AvailabilityResponse> {
        return axiosInstance({
            method: "GET",
            baseURL: process.env.REACT_APP_API_BASE_URL,
            url: `/${OAUTH}/${ACCOUNTS}/${EMAIL}/${email}/${IS_AVAILABLE}`,
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json"
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

    public static registerWithGoogle(googleRegistrationRequest: GoogleRegistrationRequest): AxiosPromise<RegistrationResponse> {
        return axiosInstance.post(`/${REGISTRATION}/${GOOGLE}`, googleRegistrationRequest);
    }

    public static getUserProfilePhotos(userId: string): AxiosPromise<UserProfilePhoto[]> {
        return axiosInstance.get(`/${USERS}/${userId}/${PHOTOS}`);
    }

    public static createUserProfilePhoto(userId: string, createUserProfilePhotoRequest: CreateUserProfilePhotoRequest): AxiosPromise<UserProfilePhoto> {
        return axiosInstance.post(`/${USERS}/${userId}/${PHOTOS}`, createUserProfilePhotoRequest);
    }
}
