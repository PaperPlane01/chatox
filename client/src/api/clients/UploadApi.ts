import {AxiosPromise, AxiosRequestConfig} from "axios";
import {axiosInstance} from "../axios-instance";
import {AudioUploadMetadata, ImageUploadMetadata, Upload, VideoUploadMetadata} from "../types/response";
import {AUDIOS, FILES, IMAGES, UPLOADS, VIDEOS} from "../endpoints";

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

    public static uploadFile(file: File, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<any>> {
        return UploadApi.doUpload<any>(file, `/${UPLOADS}/${FILES}`, onUploadProgress);
    }

    public static doUpload<MetadataType>(file: File, url: string, onUploadProgress?: ProgressCallback): AxiosPromise<Upload<MetadataType>> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("originalName", file.name);
        const config: AxiosRequestConfig = {};

        if (onUploadProgress) {
            config.onUploadProgress = progressEvent => {
                const percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
                onUploadProgress(percentage);
            }
        }

        return axiosInstance.post(url, formData, config);
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
}
