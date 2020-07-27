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

    public findGif(id: string): Upload<GifUploadMetadata> {
        return this.findById(id) as Upload<GifUploadMetadata>;
    }

    public findAudio(id: string): Upload<AudioUploadMetadata> {
        return this.findById(id) as Upload<AudioUploadMetadata>;
    }

    public findVideo(id: string): Upload<VideoUploadMetadata> {
        return this.findById(id) as Upload<VideoUploadMetadata>;
    }

    protected convertToNormalizedForm(denormalizedEntity: Upload<any>): Upload<any> {
        return denormalizedEntity;
    }
}
