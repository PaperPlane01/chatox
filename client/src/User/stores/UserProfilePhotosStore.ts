import {UserProfilePhotoEntity} from "../types";
import {UserProfilePhoto} from "../../api/types/response";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {merge} from "lodash";

export class UserProfilePhotosStore extends AbstractEntityStore<"userProfilePhotos", UserProfilePhotoEntity, UserProfilePhoto> {
    createPatchForArray(denormalizedEntities: UserProfilePhoto[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("uploads", "userProfilePhotos");

        denormalizedEntities.forEach(userProfilePhoto => {
            patch.ids.userProfilePhotos.push(userProfilePhoto.id);
            patch.entities.userProfilePhotos[userProfilePhoto.id] = this.convertToNormalizedForm(userProfilePhoto);

            const uploadsPatch = this.entities.uploads.createPatch(userProfilePhoto.upload);

            if (this.isPatchPopulated(uploadsPatch, "uploads")) {
                patch.ids.uploads.push(...uploadsPatch.ids.uploads);
                merge(patch.entities.uploads, uploadsPatch.entities.uploads);
            }
        });

        return patch;
    }

    protected convertToNormalizedForm(denormalizedEntity: UserProfilePhoto): UserProfilePhotoEntity {
        return {
            id: denormalizedEntity.id,
            uploadId: denormalizedEntity.upload.id
        };
    }
}