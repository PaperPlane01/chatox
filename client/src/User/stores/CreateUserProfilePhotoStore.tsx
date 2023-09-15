import {makeAutoObservable, reaction, runInAction} from "mobx";
import {UserProfilePhotosGalleryStore} from "./UserProfilePhotosGalleryStore";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {CreateUserProfilePhotoRequest} from "../../api/types/request";
import {CurrentUser, ImageUploadMetadata, Upload} from "../../api/types/response";
import {UploadImageStore} from "../../Upload";
import {AuthorizationStore} from "../../Authorization";
import {Labels} from "../../localization";
import {EntitiesStore} from "../../entities-store";

export class CreateUserProfilePhotoStore {
    userProfilePhotoPending = false;

    userProfilePhotoError?: ApiError = undefined;

    setAsAvatar = false;

    createUserProfilePhotoDialogOpen = false;

    get uploadPending(): boolean {
        return this.imageUpload.pending;
    }

    get pending(): boolean {
        return this.userProfilePhotoPending || this.uploadPending;
    }

    get uploadImageError(): ApiError | undefined {
        return this.imageUpload.submissionError;
    }

    get uploadValidationError(): keyof Labels | undefined {
        return this.imageUpload.validationError;
    }

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    get uploadedFile(): Upload<ImageUploadMetadata> | undefined {
        return this.imageUpload.imageContainer?.uploadedFile;
    }

    constructor(public readonly imageUpload: UploadImageStore,
                private readonly authorization: AuthorizationStore,
                private readonly entities: EntitiesStore,
                private readonly userProfilePhotosGallery: UserProfilePhotosGalleryStore) {
        makeAutoObservable(this);

        reaction(
            () => this.uploadedFile,
            file => {
                console.log("reacting to file")

                if (file) {
                    this.createProfilePhoto(true);
                }
            }
        );
    }

    setSetAsAvatar = (setAsAvatar: boolean): void => {
        this.setAsAvatar = setAsAvatar;
    }

    uploadImage = (file: File): void => {
        this.imageUpload.uploadFile(file);
    }

    createProfilePhoto = (openProfileGalleryOnSuccess: boolean): void => {
        if (!this.currentUser) {
            return;
        }

        if (!this.imageUpload.imageContainer || !this.imageUpload.imageContainer.uploadedFile) {
            return;
        }

        if (this.uploadValidationError) {
            return;
        }

        if (this.uploadImageError) {
            return;
        }

        this.userProfilePhotoPending = true;
        this.userProfilePhotoError = undefined;

        const request: CreateUserProfilePhotoRequest = {
            uploadId: this.imageUpload.imageContainer.uploadedFile.id,
            setAsAvatar: this.setAsAvatar
        };

        const userId = this.currentUser.id;

        UserApi.createUserProfilePhoto(userId, request)
            .then(({data}) => {
                this.entities.userProfilePhotos.insert(data);
                this.userProfilePhotosGallery.addPhotoToUser(userId, data.id);

                const user = this.entities.users.findByIdOptional(userId);

                if (user && request.setAsAvatar) {
                    this.entities.users.insertEntity({
                        ...user,
                        avatarId: data.upload.id
                    });

                    if (this.currentUser && this.currentUser.id === user.id) {
                        this.authorization.setCurrentUser({
                            ...this.currentUser,
                            avatarId: data.upload.id
                        });
                    }
                }

                this.setCreateUserProfilePhotoDialogOpen(false);
                this.imageUpload.reset();

                if (openProfileGalleryOnSuccess) {
                    this.userProfilePhotosGallery.setGalleryOpen(true);
                }
            })
            .catch(error => runInAction(() => this.userProfilePhotoError = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.userProfilePhotoPending = false));
    }

    setCreateUserProfilePhotoDialogOpen = (createUserProfilePhotoDialogOpen: boolean): void => {
        this.createUserProfilePhotoDialogOpen = createUserProfilePhotoDialogOpen;
    }
}