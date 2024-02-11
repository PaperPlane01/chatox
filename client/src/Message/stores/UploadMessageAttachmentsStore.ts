import {makeAutoObservable, runInAction} from "mobx";
import {AxiosPromise} from "axios";
import {AUDIO_MAX_SIZE, FILE_MAX_SIZE, IMAGE_MAX_SIZE, VIDEO_MAX_SIZE} from "../constants";
import {getInitialApiErrorFromResponse, ProgressCallback, UploadApi} from "../../api";
import {AudioUploadMetadata, Upload, UploadType} from "../../api/types/response";
import {UploadedFileContainer} from "../../utils/file-utils";
import {Labels} from "../../localization";

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

    get hasVoiceMessage(): boolean {
        return this.messageAttachmentsFiles
            .filter(fileContainer => fileContainer.expectedUploadType === UploadType.VOICE_MESSAGE)
            .length !== 0;
    }

    get voiceMessageContainer(): UploadedFileContainer<AudioUploadMetadata> | undefined {
        return this.messageAttachmentsFiles
            .find(fileContainer => fileContainer.expectedUploadType === UploadType.VOICE_MESSAGE);
    }

    setMessageAttachmentsFiles = (messageAttachmentsFiles: UploadedFileContainer[]): void => {
        this.messageAttachmentsFiles = messageAttachmentsFiles;
    }

    removeAttachment = (localId: string): void => {
        this.messageAttachmentsFiles = this.messageAttachmentsFiles.filter(attachment => attachment.localId !== localId);
    }

    setAttachedFilesDialogOpen = (attachedFilesDialogOpen: boolean): void => {
        this.attachedFilesDialogOpen = attachedFilesDialogOpen;
    }

    attachImages = (images: FileList): void => {
        this.attachFiles(this.sliceFileList(images), IMAGE_MAX_SIZE, UploadApi.uploadImage, UploadType.IMAGE);
    }

    attachVideos = (videos: FileList): void => {
        this.attachFiles(this.sliceFileList(videos), VIDEO_MAX_SIZE, UploadApi.uploadVideo, UploadType.VIDEO);
    }

    attachAudios = (audios: FileList): void => {
        this.attachFiles(this.sliceFileList(audios), AUDIO_MAX_SIZE, UploadApi.uploadAudio, UploadType.AUDIO);
    }

    attachVoiceMessage = (voiceMessages: FileList): void => {
        this.attachFiles(
            this.sliceFileList(voiceMessages, 1),
            AUDIO_MAX_SIZE,
            UploadApi.uploadVoiceMessage,
            UploadType.VOICE_MESSAGE
        );
    }

    attachAnyFiles = (files: FileList): void => {
        this.attachFiles(this.sliceFileList(files), FILE_MAX_SIZE, UploadApi.uploadFile, UploadType.FILE);
    }

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
            this.uploadFile(file, fileContainer.localId, uploadFile);
        }

        if (validationErrors.length !== 0) {
            this.setFileValidationErrors(validationErrors);
        }
    }

    uploadFile = (file: File, localFileId: string, uploadFile: UploadFileFunction): void => {
        const formData = new FormData();
        formData.append("file", file);

        if (file.name) {
            formData.append("originalFileName", file.name);
        }

        uploadFile(file, percentage => {
            this.uploadPercentageMap = {
                ...this.uploadPercentageMap,
                [localFileId]: percentage
            };
        })
            .then(({data}) => {
                runInAction(() => {
                    this.messageAttachmentsFiles = this.messageAttachmentsFiles.map(fileContainer => {
                        if (fileContainer.localId === localFileId) {
                            fileContainer.pending = false;
                            fileContainer.uploadedFile = data;
                        }

                        return fileContainer;
                    });
                });
            })
            .catch(error => {
                runInAction(() => {
                    this.messageAttachmentsFiles = this.messageAttachmentsFiles.map(fileContainer => {
                        if (fileContainer.localId === localFileId) {
                            fileContainer.pending = false;
                            fileContainer.error = getInitialApiErrorFromResponse(error);
                        }

                        return fileContainer;
                    });
                });
            });
    }

    setFileValidationErrors = (validationErrors: ValidationError[]): void => {
        this.fileValidationErrors = validationErrors;
    }

    reset = (): void => {
        this.messageAttachmentsFiles = [];
        this.uploadPercentageMap = {};
    }

    private sliceFileList(files: FileList, allowedSize: number = 10): FileList {
        const fileAttachmentsRemaining = allowedSize - this.messageAttachmentsFiles.length;

        if (files.length > fileAttachmentsRemaining) {
            files = Array.prototype.slice.call(files, 0, fileAttachmentsRemaining) as unknown as FileList;
        }

        return files;
    }
}
