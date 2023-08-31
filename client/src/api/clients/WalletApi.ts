import {AxiosPromise} from "axios";
import {Balance} from "../types/response/Balance";
import {BALANCE} from "../endpoints";
import {axiosInstance} from "../axios-instance";

export class WalletApi {

    public static getBalance(): AxiosPromise<Balance[]> {
        return axiosInstance.get(BALANCE);
    }
}