import {Labels} from "../localization/types";
import {AxiosError} from "axios";

export const API_UNREACHABLE_STATUS = 123456789;

export interface ApiError {
    status: number,
    message: keyof Labels,
    bindings?: any
}

export const getInitialApiErrorFromResponse = (errorResponse: AxiosError): ApiError => {
    if (errorResponse.response) {
        return {status: errorResponse.response.status, message: "error.unknown"};
    } else {
        return {status: API_UNREACHABLE_STATUS, message: "server.unreachable"};
    }
};
