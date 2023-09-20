import {makeAutoObservable, runInAction} from "mobx";
import {UserProfileStore} from "./UserProfileStore";
import {UserEntity} from "../types";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {CurrentUser} from "../../api/types/response";
import {SnackbarService} from "../../Snackbar";
import {EntitiesStore} from "../../entities-store";
import {AuthorizationStore} from "../../Authorization";
import {LocaleStore} from "../../localization";

export class SetPhotoAsAvatarStore {
    pending = false;

    error?: ApiError = undefined;

    photoId?: string = undefined;

    get user(): UserEntity | undefined {
        if (!this.userProfile.selectedUserId) {
            return undefined;
        }

        return this.entities.users.findByIdOptional(this.userProfile.selectedUserId);
    }

    get currentUser(): CurrentUser | undefined {
        return this.authorization.currentUser;
    }

    constructor(private readonly userProfile: UserProfileStore,
                private readonly entities: EntitiesStore,
                private readonly authorization: AuthorizationStore,
                private readonly localization: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        makeAutoObservable(this);
    }

    setPhotoId = (photoId?: string): void => {
        this.photoId = photoId;
    }

    setPhotoAsAvatar = (): void => {
        if (!this.photoId || !this.user) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const user = this.user;
        const photoId = this.photoId;

        UserApi.setUserProfilePhotoAsAvatar(
            user.id,
            photoId,
            {
                setAsAvatar: true
            }
        )
            .then(() => runInAction(() => {
                const userProfilePhoto = this.entities.userProfilePhotos.findByIdOptional(photoId);

                if (!userProfilePhoto) {
                    return;
                }

                user.avatarId = userProfilePhoto.uploadId;

                this.entities.users.insertEntity(user);

                if (this.currentUser && this.currentUser.id === user.id) {
                    this.authorization.setCurrentUser({
                        ...this.currentUser,
                        avatarId: userProfilePhoto.uploadId
                    })
                }

                this.snackbarService.enqueueSnackbar(
                    this.localization.getCurrentLanguageLabel("photo.avatar.update.success")
                );
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }
}