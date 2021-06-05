import {action, observable} from "mobx";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ApiError, getInitialApiErrorFromResponse, UploadApi} from "../../api";
import {ImageUploadMetadata, UploadType} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {Labels} from "../../localization";

const IMAGE_MAX_SIZE = Number(process.env.REACT_APP_IMAGE_MAX_SIZE);

export class UploadImageStore {
    @observable
    imageContainer?: UploadedFileContainer<ImageUploadMetadata> = undefined;

    @observable
    validationError?: keyof Labels = undefined;

    @observable
    submissionError?: ApiError = undefined;

    @observable
    pending: boolean = false;

    constructor(private readonly entities: EntitiesStore) {}

    @action
    uploadFile = (file: File): void => {
        this.imageContainer = new UploadedFileContainer<ImageUploadMetadata>(file, UploadType.IMAGE);

        if (!this.validateFile()) {
            return;
        }

        this.imageContainer.pending = true;
        this.pending = true;

        UploadApi.uploadImage(file)
            .then(({data}) => {
                if (this.imageContainer) {
                    this.imageContainer.uploadedFile = data;
                    this.entities.uploads.insert(data);
                }
            })
            .catch(error => this.submissionError = getInitialApiErrorFromResponse(error))
            .finally(() => {
                if (this.imageContainer) {
                    this.imageContainer.pending = false;
                }
                this.pending = false;
            });
    };

    @action
    validateFile = (): boolean => {
        this.validationError = undefined;

        if (this.imageContainer && this.imageContainer.file) {
            if (this.imageContainer.file.size > IMAGE_MAX_SIZE) {
                this.validationError = "upload.file.too-large";
                return false;
            }
        }

        return true;
    }
}
