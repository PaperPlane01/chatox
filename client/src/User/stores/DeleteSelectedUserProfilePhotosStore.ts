import {makeAutoObservable, runInAction} from "mobx";
import {UserProfilePhotosGalleryStore} from "./UserProfilePhotosGalleryStore";
import {SelectedUserProfilePhotosStore} from "./SelectedUserProfilePhotosStore";
import {UserProfileStore} from "./UserProfileStore";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";

export class DeleteSelectedUserProfilePhotosStore {
    pending = false;

    error?: ApiError = undefined;

    get userId(): string | undefined {
        return this.userProfile.selectedUserId;
    }

    constructor(private readonly userPhotosGallery: UserProfilePhotosGalleryStore,
                private readonly selectedUserPhotos: SelectedUserProfilePhotosStore,
                private readonly entities: EntitiesStore,
                private readonly userProfile: UserProfileStore,
                private readonly localization: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    deleteSelectedPhotos = (): void => {
        if (!this.userId) {
            return;
        }

        if (this.selectedUserPhotos.selectedPhotosIds.length === 0) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const userId = this.userId;
        const userProfilePhotosIds = this.selectedUserPhotos.selectedPhotosIds;

        UserApi.deleteMultipleUserProfilePhotos(
            userId,
            {
                userProfilePhotosIds
            }
        )
            .then(() => runInAction(() => {
                this.selectedUserPhotos.clearSelection();
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