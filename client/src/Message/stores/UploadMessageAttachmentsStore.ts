import {action, computed, observable, makeObservable, makeAutoObservable} from "mobx";
import {AxiosPromise} from "axios";
import {getInitialApiErrorFromResponse, ProgressCallback} from "../../api";
import {UploadApi} from "../../api/clients";
import {Upload, UploadType} from "../../api/types/response";
import {UploadedFileContainer} from "../../utils/file-utils";
import {Labels} from "../../localization/types";

const IMAGE_MAX_SIZE = Number(process.env.REACT_APP_IMAGE_MAX_SIZE);
const VIDEO_MAX_SIZE = Number(process.env.REACT_APP_VIDEO_MAX_SIZE)
const AUDIO_MAX_SIZE = Number(process.env.REACT_APP_AUDIO_MAX_SIZE);
const FILE_MAX_SIZE = Number(process.env.REACT_APP_FILE_MAX_SIZE);

type UploadFileFunction = (file: File, onUploadProgress?: ProgressCallback) => AxiosPromise<Upload<any>>;

interface UploadPercentageMap {
    [localId: string]: number
}

interface ValidationError {
    label: keyof Labels,
    bindings?: any
}

export class UploadMessageAttachmentsStore {
    messageAttachmentsFiles: UploadedFileContainer[] = [];

    fileValidationErrors: ValidationError[] = [];

    attachedFilesDialogOpen: boolean = false;

    uploadPercentageMap: UploadPercentageMap = {};

    constructor() {
        makeAutoObservable(this);
    }

    get uploadPending(): boolean {
        return this.messageAttachmentsFiles.filter(fileContainer => fileContainer.pending).length !== 0;
    }

    get uploadedAttachmentsCount(): number {
        return this.messageAttachmentsFiles
            .filter(fileContainer => Boolean(fileContainer.uploadedFile))
            .length
    }

    removeAttachment = (localId: string): void => {
        this.messageAttachmentsFiles = this.messageAttachmentsFiles.filter(attachment => attachment.localId !== localId);
    };

    setAttachedFilesDialogOpen = (attachedFilesDialogOpen: boolean): void => {
        this.attachedFilesDialogOpen = attachedFilesDialogOpen;
    };

    attachImages = (images: FileList): void => {
        this.attachFiles(this.sliceFileList(images), IMAGE_MAX_SIZE, UploadApi.uploadImage, UploadType.IMAGE);
    };

    attachVideos = (videos: FileList): void => {
        this.attachFiles(this.sliceFileList(videos), VIDEO_MAX_SIZE, UploadApi.uploadVideo, UploadType.VIDEO);
    };

    attachAudios = (audios: FileList): void => {
        this.attachFiles(this.sliceFileList(audios), AUDIO_MAX_SIZE, UploadApi.uploadAudio, UploadType.AUDIO);
    };

    attachAnyFiles = (files: FileList): void => {
        this.attachFiles(this.sliceFileList(files), FILE_MAX_SIZE, UploadApi.uploadFile, UploadType.FILE);
    };

    attachFiles = (files: FileList, fileMaxSize: number, uploadFile: UploadFileFunction, expectedUploadType: UploadType): void => {
        let validationErrors: ValidationError[] = [];

        for (let file of files) {
            if (file.size > fileMaxSize) {
                if (file.name && file.name.length !== 0) {
                    validationErrors.push({
                        label: "file.too-large.with-file-name",
                        bindings: {
                            fileName: file.name
                        }
                    });
                } else {
                    validationErrors.push({label: "file.too-large"});
                }
                continue;
            }

            const fileContainer = new UploadedFileContainer(file, expectedUploadType, true);
            this.messageAttachmentsFiles = [
                ...this.messageAttachmentsFiles,
                fileContainer
            ];
            this.uploadFile(fileContainer.file, fileContainer.localId, uploadFile);
        }

        if (validationErrors.length !== 0) {
            this.setFileValidationErrors(validationErrors);
        }
    };

    uploadFile = (file: File, localFileId: string, uploadFile: UploadFileFunction): void => {
        const formData = new FormData();
        formData.append("file", file);

        if (file.name) {
            formData.append("originalFileName", file.name);
        }

        uploadFile(file, percentage => {
            console.log(`Percentage: ${percentage}`);
            this.uploadPercentageMap = {
                ...this.uploadPercentageMap,
                [localFileId]: percentage
            };
        })
            .then(({data}) => {
                this.messageAttachmentsFiles = this.messageAttachmentsFiles.map(fileContainer => {
                    if (fileContainer.localId === localFileId) {
                        fileContainer.pending = false;
                        fileContainer.uploadedFile = data;
                    }

                return fileContainer;
            })
        })
            .catch(error => {
                this.messageAttachmentsFiles = this.messageAttachmentsFiles.map(fileContainer => {
                    if (fileContainer.localId === localFileId) {
                        fileContainer.pending = false;
                        fileContainer.error = getInitialApiErrorFromResponse(error);
                    }

                    return fileContainer;
                })
            })
    };

    setFileValidationErrors = (validationErrors: ValidationError[]): void => {
        this.fileValidationErrors = validationErrors;
    };

    reset = (): void => {
        this.messageAttachmentsFiles = [];
        this.uploadPercentageMap = {};
    };

    private sliceFileList(files: FileList): FileList {
        const fileAttachmentsRemaining = 10 - this.messageAttachmentsFiles.length;

        if (files.length > fileAttachmentsRemaining) {
            files = Array.prototype.slice.call(files, 0, fileAttachmentsRemaining) as unknown as FileList;
        }

        return files;
    }
}
