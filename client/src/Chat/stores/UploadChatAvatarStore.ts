import {observable, action, computed} from "mobx";
import {UploadApi} from "../../api/clients";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ImageUploadMetadata} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {Labels} from "../../localization/types";
import {ApiError, getInitialApiErrorFromResponse} from "../../api";

const AVATAR_MAX_SIZE = 10485760;

export class UploadChatAvatarStore {
    @observable
    avatarContainer?: UploadedFileContainer<ImageUploadMetadata> = undefined;

    @observable
    validationError?: keyof Labels = undefined;

    @observable
    submissionError?: ApiError = undefined;

    @observable
    pending: boolean = false;

    constructor(private readonly entities: EntitiesStore) {}

    @action
    uploadFile = (file: File): void => {
        this.avatarContainer = new UploadedFileContainer<ImageUploadMetadata>(file);

        if (!this.validateFile()) {
            return;
        }

        this.avatarContainer.pending = true;
        this.pending = true;

        UploadApi.uploadImage(file)
            .then(({data}) => {
                if (this.avatarContainer) {
                    this.avatarContainer.uploadedFile = data;
                    this.entities.uploads.insert(data);
                }
            })
            .catch(error => this.submissionError = getInitialApiErrorFromResponse(error))
            .finally(() => {
                if (this.avatarContainer) {
                    this.avatarContainer.pending = false;
                }
                this.pending = false;
            });
    };

    @action
    validateFile = (): boolean => {
        this.validationError = undefined;

        if (this.avatarContainer && this.avatarContainer.file) {
            if (this.avatarContainer.file.size > AVATAR_MAX_SIZE) {
                this.validationError = "upload.file.too-large";
                return false;
            }
        }

        return true;
    }
}
