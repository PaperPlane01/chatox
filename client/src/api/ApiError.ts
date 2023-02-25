import {AxiosError} from "axios";
import {Labels} from "../localization";

export const API_UNREACHABLE_STATUS = 123456789;

export interface ApiError {
    status: number,
    message: keyof Labels,
    bindings?: any,
    metadata?: {
        [key: string]: any
    }
}

export const getInitialApiErrorFromResponse = (errorResponse: AxiosError): ApiError => {
    if (errorResponse.response) {
        return {
            status: errorResponse.response.status,
            message: "error.unknown",
            metadata: (errorResponse.response.data as any).metadata
        };
    } else {
        return {status: API_UNREACHABLE_STATUS, message: "server.unreachable"};
    }
};
