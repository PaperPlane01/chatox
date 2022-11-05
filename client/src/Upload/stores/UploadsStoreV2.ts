import {createTransformer} from "mobx-utils";
import {AbstractEntityStoreV2} from "../../entity-store";
import {
    AudioUploadMetadata,
    GifUploadMetadata,
    ImageUploadMetadata,
    Upload,
    VideoUploadMetadata
} from "../../api/types/response";
import {EntitiesPatch} from "../../entities-store";

export class UploadsStoreV2 extends AbstractEntityStoreV2<"uploads", Upload<any>, Upload<any>> {
    findImage = createTransformer((id: string) => this.findById(id) as Upload<ImageUploadMetadata>);

    findGif = createTransformer((id: string) => this.findById(id) as Upload<GifUploadMetadata>);

    findAudio = createTransformer((id: string) => this.findById(id) as Upload<AudioUploadMetadata>);

    findVideo = createTransformer((id: string) => this.findById(id) as Upload<VideoUploadMetadata>);

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