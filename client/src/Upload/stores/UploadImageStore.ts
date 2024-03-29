import {makeAutoObservable, runInAction} from "mobx";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ApiError, getInitialApiErrorFromResponse, UploadApi} from "../../api";
import {ImageUploadMetadata, UploadType} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {Labels} from "../../localization";

const IMAGE_MAX_SIZE = import.meta.env.VITE_IMAGE_MAX_SIZE;

export class UploadImageStore {
    imageContainer?: UploadedFileContainer<ImageUploadMetadata> = undefined;

    validationError?: keyof Labels = undefined;

    submissionError?: ApiError = undefined;

    pending: boolean = false;

    constructor(private readonly entities: EntitiesStore) {
        makeAutoObservable(this);
    }

    uploadFile = (file: File): void => {
        this.imageContainer = new UploadedFileContainer<ImageUploadMetadata>(file, UploadType.IMAGE);

        if (!this.validateFile()) {
            return;
        }

        this.imageContainer.pending = true;
        this.pending = true;

        UploadApi.uploadImage(file)
            .then(({data}) => runInAction(() => {
                if (this.imageContainer) {
                    this.imageContainer.uploadedFile = data;
                    this.entities.uploads.insert(data);
                }
            }))
            .catch(error => runInAction(() => this.submissionError = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => {
                if (this.imageContainer) {
                    this.imageContainer.pending = false;
                }
                this.pending = false;
            }));
    }

    validateFile = (): boolean => {
        this.validationError = undefined;

        if (this.imageContainer && this.imageContainer.file && this.imageContainer.file.size > IMAGE_MAX_SIZE) {
            this.validationError = "upload.file.too-large";
            return false;
        }

        return true;
    }

    reset = (): void => {
        this.imageContainer = undefined;
        this.validationError = undefined;
        this.pending = false;
        this.submissionError = undefined;
    }
}
