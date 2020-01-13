import axios, {AxiosRequestConfig} from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import queryString from "query-string";
import {API_ROOT, OAUTH, TOKEN} from "./endpoints";

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

const refreshAccessToken = (originalRequest: AxiosRequestConfig): Promise<void> => {
    if (localStorage.getItem("refreshToken")) {
        return axios({
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
                const {access_token, refresh_token} = response.data;
                localStorage.setItem("accessToken", access_token);
                localStorage.setItem("refreshToken", refresh_token);
                originalRequest.headers.Authoruzation = `Bearer ${access_token}`;
                return Promise.resolve();
            })
            .catch(error => {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                delete originalRequest.headers.Authorization;
                return Promise.resolve();
            })
    } else {
        delete originalRequest.headers.Authorization;
        return Promise.resolve();
    }
};

// @ts-ignore
createAuthRefreshInterceptor(_axiosInstance, refreshAccessToken);

export const axiosInstance = _axiosInstance;
