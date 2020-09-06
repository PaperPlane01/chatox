import {observable, action, computed} from "mobx";
import {AxiosPromise} from "axios";
import {getInitialApiErrorFromResponse} from "../../api";
import {UploadApi} from "../../api/clients";
import {Upload} from "../../api/types/response";
import {UploadedFileContainer} from "../../utils/file-utils";
import {Labels} from "../../localization/types";

const IMAGE_MAX_SIZE = Number(process.env.REACT_APP_IMAGE_MAX_SIZE);
const VIDEO_MAX_SIZE = Number(process.env.REACT_APP_VIDEO_MAX_SIZE)
const AUDIO_MAX_SIZE = Number(process.env.REACT_APP_AUDIO_MAX_SIZE);
const FILE_MAX_SIZE = Number(process.env.REACT_APP_FILE_MAX_SIZE);

type UploadFileFunction = (file: File) => AxiosPromise<Upload<any>>;

export class UploadMessageAttachmentsStore {
    @observable
    messageAttachmentsFiles: UploadedFileContainer[] = [];

    @observable
    errorSnackbarLabel: keyof Labels | undefined = undefined;

    @observable
    errorSnackbarBindings: any = undefined;

    @observable
    attachedFilesDialogOpen: boolean = false;

    @computed
    get uploadPending(): boolean {
        return this.messageAttachmentsFiles.filter(fileContainer => fileContainer.pending).length !== 0;
    };

    @computed
    get showErrorSnackbarLabel(): boolean {
        return this.errorSnackbarLabel !== undefined;
    };

    @computed
    get uploadedAttachmentsCount(): number {
        return this.messageAttachmentsFiles
            .filter(fileContainer => Boolean(fileContainer.uploadedFile))
            .length
    }

    @action
    setAttachedFilesDialogOpen = (attachedFilesDialogOpen: boolean): void => {
        this.attachedFilesDialogOpen = attachedFilesDialogOpen;
    };

    @action
    attachImages = (images: FileList): void => {
        this.attachFiles(this.sliceFileList(images), IMAGE_MAX_SIZE, UploadApi.uploadImage);
    };

    @action
    attachVideos = (videos: FileList): void => {
        this.attachFiles(this.sliceFileList(videos), VIDEO_MAX_SIZE, UploadApi.uploadVideo);
    };

    @action
    attachAudios = (audios: FileList): void => {
        this.attachFiles(this.sliceFileList(audios), AUDIO_MAX_SIZE, UploadApi.uploadAudio);
    };

    @action
    attachAnyFiles = (files: FileList): void => {
        this.attachFiles(this.sliceFileList(files), FILE_MAX_SIZE, UploadApi.uploadFile);
    };

    @action
    attachFiles = (files: FileList, fileMaxSize: number, uploadFile: UploadFileFunction): void => {
        for (let file of files) {
            if (file.size > fileMaxSize) {
                this.errorSnackbarLabel = "file.too-large";
                this.errorSnackbarBindings = {fileName: file.name};
                continue;
            }

            const fileContainer = new UploadedFileContainer(file, true);
            this.messageAttachmentsFiles = [
                ...this.messageAttachmentsFiles,
                fileContainer
            ];
            this.uploadFile(fileContainer.file, fileContainer.localId, uploadFile);
        }
    };

    @action
    uploadFile = (file: File, localFileId: string, uploadFile: UploadFileFunction): void => {
        const formData = new FormData();
        formData.append("file", file);

        if (file.name) {
            formData.append("originalFileName", file.name);
        }

        uploadFile(file)
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

    @action
    reset = (): void => {
        this.messageAttachmentsFiles = [];
    }

    private sliceFileList(files: FileList): FileList {
        const fileAttachmentsRemaining = 10 - this.messageAttachmentsFiles.length;

        if (files.length > fileAttachmentsRemaining) {
            files = Array.prototype.slice.call(files, 0, fileAttachmentsRemaining) as unknown as FileList;
        }

        return files;
    };
}