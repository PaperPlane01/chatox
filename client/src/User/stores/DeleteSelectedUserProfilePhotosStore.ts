import {makeAutoObservable, runInAction} from "mobx";
import {UserProfilePhotosGalleryStore} from "./UserProfilePhotosGalleryStore";
import {SelectedUserProfilePhotosStore} from "./SelectedUserProfilePhotosStore";
import {UserProfileStore} from "./UserProfileStore";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";
import {CurrentUser} from "../../api/types/response";
import {UserEntity} from "../types";
import {isDefined} from "../../utils/object-utils";
import {AuthorizationStore} from "../../Authorization";

export class DeleteSelectedUserProfilePhotosStore {
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
                private readonly selectedUserPhotos: SelectedUserProfilePhotosStore,
                private readonly entities: EntitiesStore,
                private readonly userProfile: UserProfileStore,
                private readonly localization: LocaleStore,
                private readonly authorization: AuthorizationStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    deleteSelectedPhotos = (): void => {
        if (!this.user) {
            return;
        }

        if (this.selectedUserPhotos.selectedPhotosIds.length === 0) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const user = this.user;
        const userId = user.id;
        const userProfilePhotosIds = this.selectedUserPhotos.selectedPhotosIds;
        const containsAvatar = isDefined(user.avatarId) && this.entities.userProfilePhotos
            .findAllById(userProfilePhotosIds)
            .map(userProfilePhoto => userProfilePhoto.uploadId)
            .includes(user.avatarId);

        UserApi.deleteMultipleUserProfilePhotos(
            userId,
            {
                userProfilePhotosIds
            }
        )
            .then(() => runInAction(() => {
                this.selectedUserPhotos.clearSelection();

                if (containsAvatar) {
                    user.avatarId = undefined;
                    this.entities.users.insertEntity(user);

                    if (this.currentUser && this.currentUser.id === user.id) {
                        this.authorization.setCurrentUser({
                            ...this.currentUser,
                            avatarId: undefined
                        });
                    }
                }

                this.userPhotosGallery.removePhotosOfUser(userId, userProfilePhotosIds);
                this.entities.userProfilePhotos.deleteAllById(userProfilePhotosIds);
                this.snackbarService.enqueueSnackbar(
                    this.localization.getCurrentLanguageLabel("photo.delete.success")
                );
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }
}