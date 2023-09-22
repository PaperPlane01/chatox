import {makeAutoObservable, runInAction} from "mobx";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {UserProfileStore} from "./UserProfileStore";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {LocaleStore} from "../../localization";
import {SnackbarService} from "../../Snackbar";
import {UserEntity} from "../types";
import {CurrentUser} from "../../api/types/response";
import {isDefined} from "../../utils/object-utils";
import {UserProfilePhotosGalleryStore} from "./UserProfilePhotosGalleryStore";

export class DeleteUserProfilePhotoStore {
    photoId?: string = undefined;

    pending = false;

    error?: ApiError = undefined;

    get user(): UserEntity | undefined {
        if (!this.userProfile.selectedUserId) {
            return undefined;
        }

        return this.entities.users.findByIdOptional(this.userProfile.selectedUserId);
    }

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly userPhotosGallery: UserProfilePhotosGalleryStore,
                private readonly userProfile: UserProfileStore,
                private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly localization: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    setPhotoId = (photoId?: string): void => {
        this.photoId = photoId;
    }

    deleteUserProfilePhoto = (): void => {
        if (!this.photoId) {
            return;
        }

        if (!this.user) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const user = this.user;
        const userId = user.id;
        const photoId = this.photoId;
        const isAvatar = isDefined(user.avatarId)
            && this.entities.userProfilePhotos.findById(photoId).uploadId === user.avatarId;

        UserApi.deleteUserProfilePhoto(userId, photoId)
            .then(() => runInAction(() => {
                this.userPhotosGallery.removePhotosOfUser(userId, [photoId]);

                if (isAvatar) {
                    user.avatarId = undefined;
                    this.entities.users.insertEntity(user);

                    if (this.currentUser && this.currentUser.id === userId) {
                        this.authorization.setCurrentUser({
                            ...this.currentUser,
                            avatarId: undefined
                        });
                    }
                }

                this.entities.userProfilePhotos.deleteById(photoId);

                this.snackbarService.enqueueSnackbar(
                    this.localization.getCurrentLanguageLabel("photo.delete.success.singular")
                );
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }
}