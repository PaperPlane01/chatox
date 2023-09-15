import {makeAutoObservable, reaction, runInAction, toJS} from "mobx";
import {Slide} from "yet-another-react-lightbox";
import {UserProfileStore} from "./UserProfileStore";
import {ApiError, getInitialApiErrorFromResponse, UserApi} from "../../api";
import {ImageUploadMetadata, TimeUnit, Upload} from "../../api/types/response";
import {EntitiesStore} from "../../entities-store";
import {ExpirableStore} from "../../expirable-store";
import {Duration} from "../../utils/date-utils";

type CustomSlide = Slide & {uploadId: string};

export class UserProfilePhotosGalleryStore {
    pending = false;

    error?: ApiError = undefined;

    lightboxOpen = false;

    galleryOpen = false;

    currentLightboxIndex = 0;

    photosByUser = new ExpirableStore<string, string[]>(
        Duration.of(15, TimeUnit.MINUTES),
        userId => userId !== this.userId
    );

    get userId(): string | undefined {
        return this.userProfile.selectedUserId;
    }

    get currentUserProfilePhotosIds(): string[] {
        if (!this.userId) {
            return [];
        }

        return this.photosByUser.storage.get(this.userId) || [];
    }

    get uploads(): Array<Upload<ImageUploadMetadata>> {
        if (this.currentUserProfilePhotosIds.length === 0) {
            return [];
        }

        const photos = this.entities.userProfilePhotos.findAllById(this.currentUserProfilePhotosIds);

        return this.entities.uploads
            .findAllById(photos.map(photo => photo.uploadId)) as Array<Upload<ImageUploadMetadata>>;
    }

    get lightboxSlides(): CustomSlide[] {
        return this.uploads.map(upload => ({
            src: upload.uri,
            width: upload.meta?.width,
            height: upload.meta?.height,
            type: "image",
            uploadId: upload.id
        }));
    }

    get avatarIndex(): number {
       if (!this.userId) {
           return -1;
       }

       const user = this.entities.users.findById(this.userId);

       if (!user.avatarId) {
           return -1;
       }

       return this.uploads.map(upload => upload.id).indexOf(user.avatarId);
    }

    constructor(private readonly userProfile: UserProfileStore, private readonly entities: EntitiesStore) {
        makeAutoObservable(this);

        reaction(
            () => this.galleryOpen,
            open => {
                if (open) {
                    this.fetchUserPhotos();
                }
            }
        );
    }

    fetchUserPhotos = (openToAvatarAfter: boolean = false): void => {
        if (!this.userId) {
            return;
        }

        const existingPhotos = this.photosByUser.get(this.userId);

        if (existingPhotos && existingPhotos.length !== 0) {
            return;
        }

        this.pending = true;
        this.error = undefined;

        const userId = this.userId;

        UserApi.getUserProfilePhotos(userId)
            .then(({data}) => runInAction(() => {
                this.entities.userProfilePhotos.insertAll(data);
                this.photosByUser.insert(
                    userId,
                    data.map(profilePhoto => profilePhoto.id)
                );

                if (openToAvatarAfter) {
                    this.openLightboxToAvatar();
                }
            }))
            .catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
            .finally(() => runInAction(() => this.pending = false));
    }

    openLightboxToAvatar = (): void => {
        if (!this.userId) {
            return;
        }

        if (this.photosByUser.storage.get(this.userId)) {
            this.openLightboxToIndex(this.avatarIndex);
        } else {
            this.fetchUserPhotos(true);
        }
    }

    openLightboxToIndex = (index: number): void => {
        this.setCurrentLightboxIndex(index);
        this.setLightboxOpen(true);
    }

    setCurrentLightboxIndex = (currentLightboxIndex: number): void => {
        this.currentLightboxIndex = currentLightboxIndex;
    }

    setLightboxOpen = (lightboxOpen: boolean): void => {
        this.lightboxOpen = lightboxOpen;
    }

    setGalleryOpen = (galleryOpen: boolean): void => {
        this.galleryOpen = galleryOpen;
    }

    addPhotoToUser = (userId: string, profilePhotoId: string) => {
        const existingPhotos = this.photosByUser.storage.get(userId);

        if (!existingPhotos) {
            return;
        }

        existingPhotos.unshift(profilePhotoId);

        this.photosByUser.insert(userId, existingPhotos);
    }
}