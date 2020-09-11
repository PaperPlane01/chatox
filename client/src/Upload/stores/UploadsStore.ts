import {createTransformer} from "mobx-utils";
import {AbstractEntityStore} from "../../entity-store";
import {
    AudioUploadMetadata,
    GifUploadMetadata,
    ImageUploadMetadata,
    Upload,
    VideoUploadMetadata
} from "../../api/types/response";

export class UploadsStore extends AbstractEntityStore<Upload<any>, Upload<any>> {
    findImage = createTransformer((id: string) => this.findById(id) as Upload<ImageUploadMetadata>);

    findGif = createTransformer((id: string) => this.findById(id) as Upload<GifUploadMetadata>);

    findAudio = createTransformer((id: string) => this.findById(id) as Upload<AudioUploadMetadata>);

    findVideo = createTransformer((id: string) => this.findById(id) as Upload<VideoUploadMetadata>);

    protected convertToNormalizedForm(denormalizedEntity: Upload<any>): Upload<any> {
        return denormalizedEntity;
    }
}
