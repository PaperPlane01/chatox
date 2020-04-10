import axios, {AxiosRequestConfig} from "axios";
import {observable} from "mobx";
import queryString from "query-string";
import {API_ROOT, OAUTH, TOKEN} from "./endpoints";

export const tokenRefreshState = observable({
    refreshingToken: false
});

type RefreshTokenCallbackFunction = (accessToken?: string) => any

let subscribers: RefreshTokenCallbackFunction[] = [];

const onTokenRefreshed = (token?: string) => subscribers.map(callback => callback(token));

const addRefreshTokenSubscriber = (subscriber: RefreshTokenCallbackFunction) => subscribers.push(subscriber);

const _axiosInstance = axios.create({
    baseURL: `${process.env.REACT_APP_API_BASE_URL}/${API_ROOT}`,
    headers: {
        contentType: "application/json"
    }
});

_axiosInstance.interceptors.request.use(config => {
    const token: string | null = localStorage.getItem("accessToken");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

_axiosInstance.interceptors.response.use(undefined, error => {
    if (error.response && error.response.status === 401) {
        const originalRequest = error.response.config;
        return refreshAccessToken(originalRequest);
    }

    return Promise.reject(error);
});

const refreshAccessToken = (originalRequest: AxiosRequestConfig): Promise<any> => {
    if (localStorage.getItem("refreshToken")) {
        if (!tokenRefreshState.refreshingToken) {
            tokenRefreshState.refreshingToken = true;
            axios({
                baseURL: process.env.REACT_APP_API_BASE_URL,
                url: `/${OAUTH}/${TOKEN}?${queryString.stringify({
                    grant_type: "refresh_token",
                    refresh_token: localStorage.getItem("refreshToken"),
                    client_id: process.env.REACT_APP_CLIENT_ID,
                    client_secret: process.env.REACT_APP_CLIENT_SECRET
                })}`,
                headers: {
                    "Content-type": "application/x-www-form-urlencoded",
                    Accept: "application/json",
                    Authorization: `Bearer ${localStorage.getItem("accessToken")}`
                }
            })
                .then(response => {
                    tokenRefreshState.refreshingToken = false;
                    const {access_token, refresh_token} = response.data;
                    localStorage.setItem("accessToken", access_token);
                    localStorage.setItem("refreshToken", refresh_token);
                    onTokenRefreshed(access_token);
                    subscribers = [];
                })
                .catch(error => {
                    console.log(error);
                    localStorage.removeItem("accessToken");
                    // localStorage.removeItem("refreshToken");
                    onTokenRefreshed(undefined);
                })
                .finally(() => tokenRefreshState.refreshingToken = false);
        }

        return new Promise(resolve => {
            addRefreshTokenSubscriber(token =>{
                console.log(token);

                if (token) {
                    originalRequest.headers.Authorization = `Bearer ${token}`;
                } else {
                    delete originalRequest.headers.Authorization;
                }

                resolve(axios(originalRequest));
            })
        });
    } else {
        delete originalRequest.headers.Authorization;
        return Promise.resolve();
    }
};

export const axiosInstance = _axiosInstance;
