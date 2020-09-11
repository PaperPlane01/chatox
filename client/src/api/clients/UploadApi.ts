import {AxiosPromise, AxiosRequestConfig} from "axios";
import {axiosInstance} from "../axios-instance";
import {AudioUploadMetadata, ImageUploadMetadata, Upload, VideoUploadMetadata} from "../types/response";
import {AUDIOS, FILES, IMAGES, UPLOADS, VIDEOS} from "../endpoints";

export type OnUploadProcessCallback = (percentage: number) => void;

export class UploadApi {
    public static uploadImage(file: File, onUploadProgress?: OnUploadProcessCallback): AxiosPromise<Upload<ImageUploadMetadata>> {
        return UploadApi.doUpload<ImageUploadMetadata>(file, `/${UPLOADS}/${IMAGES}`, onUploadProgress);
    }

    public static uploadVideo(file: File, onUploadProgress?: OnUploadProcessCallback): AxiosPromise<Upload<VideoUploadMetadata>> {
        return UploadApi.doUpload<VideoUploadMetadata>(file, `/${UPLOADS}/${VIDEOS}`, onUploadProgress);
    }

    public static uploadAudio(file: File, onUploadProgress?: OnUploadProcessCallback): AxiosPromise<Upload<AudioUploadMetadata>> {
        return UploadApi.doUpload<AudioUploadMetadata>(file, `/${UPLOADS}/${AUDIOS}`, onUploadProgress);
    }

    public static uploadFile(file: File, onUploadProgress?: OnUploadProcessCallback): AxiosPromise<Upload<any>> {
        return UploadApi.doUpload<any>(file, `/${UPLOADS}/${FILES}`, onUploadProgress);
    }

    public static doUpload<MetadataType>(file: File, url: string, onUploadProgress?: OnUploadProcessCallback): AxiosPromise<Upload<MetadataType>> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("originalName", file.name);
        const config: AxiosRequestConfig = {};

        if (onUploadProgress) {
            config.onUploadProgress = progressEvent => {
                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onUploadProgress(percentage);
            }
        }

        return axiosInstance.post(url, formData, config);
    }
}
