import {AxiosPromise, AxiosRequestConfig} from "axios";
import {stringify} from "query-string";
import {axiosInstance} from "../axios-instance";
import {
    AudioUploadMetadata,
    ImageUploadMetadata,
    StickerUploadMetadata,
    Upload,
    VideoUploadMetadata
} from "../types/response";
import {AUDIOS, FILES, IMAGE_STICKER, IMAGES, INFO, STICKERS, UPLOADS, VIDEOS, VOICE, WEBP_STICKER} from "../endpoints";

export type ProgressCallback = (percentage: number) => void;

export class UploadApi {
    public static uploadImage(file: File, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<ImageUploadMetadata>> {
        return UploadApi.doUpload<ImageUploadMetadata>(file, `/${UPLOADS}/${IMAGES}`, onUploadProgress);
    }

    public static uploadVideo(file: File, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<VideoUploadMetadata>> {
        return UploadApi.doUpload<VideoUploadMetadata>(file, `/${UPLOADS}/${VIDEOS}`, onUploadProgress);
    }

    public static uploadAudio(file: File, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<AudioUploadMetadata>> {
        return UploadApi.doUpload<AudioUploadMetadata>(file, `/${UPLOADS}/${AUDIOS}`, onUploadProgress);
    }

    public static uploadVoiceMessage(file: File, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<AudioUploadMetadata>> {
        return UploadApi.doUpload<AudioUploadMetadata>(file, `/${UPLOADS}/${AUDIOS}/${VOICE}`, onUploadProgress);
    }

    public static uploadFile(file: File, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<any>> {
        return UploadApi.doUpload<any>(file, `/${UPLOADS}/${FILES}`, onUploadProgress);
    }

    public static uploadImageSticker(file: File, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<StickerUploadMetadata>> {
        return UploadApi.doUpload<StickerUploadMetadata>(file, `/${UPLOADS}/${STICKERS}/${IMAGE_STICKER}`, onUploadProgress);
    }

    public static uploadWebpSticker(file: File, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<StickerUploadMetadata>> {
        return UploadApi.doUpload<StickerUploadMetadata>(file, `/${UPLOADS}/${STICKERS}/${WEBP_STICKER}`, onUploadProgress);
    }

    public static doUpload<MetadataType>(file: File, url: string, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<MetadataType>> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("originalName", file.name);
        const config: AxiosRequestConfig = {
            headers: {
                "Content-Type": "multipart/form-data"
            },
            url,
            method: "POST",
            data: formData
        };

        if (onUploadProgress) {
            config.onUploadProgress = progressEvent => {
                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
                onUploadProgress(percentage);
            }
        }

        return axiosInstance(config);
    }

    public static downloadFile(fileName: string, onDownloadProgress?: ProgressCallback): AxiosPromise<Blob> {
        const config: AxiosRequestConfig = {
            responseType: "blob"
        };

        if (onDownloadProgress) {
            config.onDownloadProgress = progressEvent => {
                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
                onDownloadProgress(percentage);
            }
        }

        return axiosInstance.get(`/${UPLOADS}/${FILES}/${fileName}`, config);
    }
    
    public static getUploadsInfoByIds(ids: string[]): AxiosPromise<Array<Upload<any>>> {
        const request = {
            ids: JSON.stringify(ids)
        };
        return axiosInstance.get(`/${UPLOADS}/${INFO}?${stringify(request)}`)
    }
}
