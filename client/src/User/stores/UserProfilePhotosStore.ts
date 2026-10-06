import {mergeWith} from "lodash";
import {UserProfilePhotoEntity} from "../types";
import {UserProfilePhoto} from "../../api/types/response";
import {AbstractEntityStore} from "../../entity-store";
import {EntitiesPatch} from "../../entities-store";
import {mergeCustomizer} from "../../utils/object-utils";

export class UserProfilePhotosStore extends AbstractEntityStore<"userProfilePhotos", UserProfilePhotoEntity, UserProfilePhoto> {
    createPatchForArray(denormalizedEntities: UserProfilePhoto[], options: {} | undefined): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("uploads", "userProfilePhotos");
        const patches: EntitiesPatch[] = [];

        denormalizedEntities.forEach(userProfilePhoto => {
            patch.entities.userProfilePhotos.set(userProfilePhoto.id, this.convertToNormalizedForm(userProfilePhoto));

            const uploadsPatch = this.entities.uploads.createPatch(userProfilePhoto.upload);

            if (this.isPatchPopulated(uploadsPatch, "uploads")) {
                patches.push(uploadsPatch);
            }
        });

        return mergeWith(patch, ...patches, mergeCustomizer);
    }

    protected convertToNormalizedForm(denormalizedEntity: UserProfilePhoto): UserProfilePhotoEntity {
        return {
            id: denormalizedEntity.id,
            uploadId: denormalizedEntity.upload.id
        };
    }
}