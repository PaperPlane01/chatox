import {AxiosPromise} from "axios";
import {stringify} from "query-string";
import {CreateStickerPackRequest, PaginationRequest} from "../types/request";
import {StickerPack} from "../types/response";
import {axiosInstance} from "../axios-instance";
import {INSTALLED, MY, STICKER_PACKS} from "../endpoints";

export class StickerApi {
    public static createStickerPack(createStickerPackRequest: CreateStickerPackRequest): AxiosPromise<StickerPack> {
        return axiosInstance.post(`/${STICKER_PACKS}`, createStickerPackRequest);
    }

    public static findStickerPackById(id: string): AxiosPromise<StickerPack> {
        return axiosInstance.get(`/${STICKER_PACKS}/${id}`);
    }

    public static getInstalledStickerPacks(): AxiosPromise<StickerPack[]> {
        return axiosInstance.get(`/${STICKER_PACKS}/${INSTALLED}`);
    }

    public static installStickerPack(id: string): AxiosPromise<StickerPack[]> {
        return axiosInstance.put(`/${STICKER_PACKS}/${INSTALLED}/${id}`);
    }

    public static uninstallStickerPack(id: string): AxiosPromise<StickerPack[]> {
        return axiosInstance.delete(`/${STICKER_PACKS}/${INSTALLED}/${id}`);
    }

    public static getStickerPacksCreatedByCurrentUser(): AxiosPromise<StickerPack[]> {
        return axiosInstance.get(`/${STICKER_PACKS}/${MY}`);
    }

    public static searchStickerPacks(name: string, paginationRequest: PaginationRequest): AxiosPromise<StickerPack[]> {
        const queryString = stringify({
            name,
            ...paginationRequest
        });

        return axiosInstance.get(`/${STICKER_PACKS}?${queryString}`);
    }
}
