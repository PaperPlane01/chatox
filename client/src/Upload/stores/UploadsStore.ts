import {computedFn} from "mobx-utils";
import {AbstractEntityStore} from "../../entity-store";
import {
    AudioUploadMetadata,
    GifUploadMetadata,
    ImageUploadMetadata,
    Upload,
    VideoUploadMetadata
} from "../../api/types/response";
import {EntitiesPatch} from "../../entities-store";

export class UploadsStore extends AbstractEntityStore<"uploads", Upload<any>, Upload<any>> {
    findImage = computedFn((id: string) => this.findById(id) as Upload<ImageUploadMetadata>);

    findGif = computedFn((id: string) => this.findById(id) as Upload<GifUploadMetadata>);

    findAudio = computedFn((id: string) => this.findById(id) as Upload<AudioUploadMetadata>);

    findVideo = computedFn((id: string) => this.findById(id) as Upload<VideoUploadMetadata>);

    createPatchForArray(denormalizedEntities: Upload<any>[], options: {} = {}): EntitiesPatch {
        const patch = this.createEmptyEntitiesPatch("uploads");

        denormalizedEntities.forEach(upload => {
            patch.entities.uploads[upload.id] = upload;
            patch.ids.uploads.push(upload.id);
        });

        return patch;
    }

    protected convertToNormalizedForm(denormalizedEntity: Upload<any>): Upload<any> {
        return denormalizedEntity;
    }
}