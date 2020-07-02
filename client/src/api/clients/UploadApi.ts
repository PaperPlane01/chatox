import {AxiosPromise} from "axios";
import {axiosInstance} from "../axios-instance";
import {AudioUploadMetadata, ImageUploadMetadata, Upload, VideoUploadMetadata} from "../types/response";
import {AUDIOS, FILES, IMAGES, UPLOADS, VIDEOS} from "../endpoints";

export class UploadApi {
    public static uploadImage(file: File): AxiosPromise<Upload<ImageUploadMetadata>> {
        return UploadApi.doUpload<ImageUploadMetadata>(file, `/${UPLOADS}/${IMAGES}`);
    }

    public static uploadVideo(file: File): AxiosPromise<Upload<VideoUploadMetadata>> {
        return UploadApi.doUpload<VideoUploadMetadata>(file, `/${UPLOADS}/${VIDEOS}`);
    }

    public static uploadAudio(file: File): AxiosPromise<Upload<AudioUploadMetadata>> {
        return UploadApi.doUpload<AudioUploadMetadata>(file, `/${UPLOADS}/${AUDIOS}`);
    }

    public static uploadFile(file: File): AxiosPromise<Upload<any>> {
        return UploadApi.doUpload<any>(file, `/${UPLOADS}/${FILES}`);
    }

    public static doUpload<MetadataType>(file: File, url: string): AxiosPromise<Upload<MetadataType>> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("originalName", file.name);
        return axiosInstance.post(url, formData);
    }
}
