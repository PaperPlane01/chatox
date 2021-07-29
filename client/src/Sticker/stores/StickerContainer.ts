import {action, computed, observable} from "mobx";
import {createTransformer} from "mobx-utils";
import {v4} from "uuid";
import {EmojiData} from "emoji-mart";
import {validateStickerEmojis, validateStickerKeywords} from "../validation";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ImageUploadMetadata} from "../../api/types/response";
import {FormErrors} from "../../utils/types";
import {UploadImageStore} from "../../Upload";
import {Labels} from "../../localization";

export class StickerContainer {
    @observable
    localId = v4()

    @observable
    keywords: string[] = [];

    @observable
    emojis: EmojiData[] = [];

    @observable
    imageValidationError?: keyof Labels = undefined;

    @observable
    errors: FormErrors<Pick<StickerContainer, "keywords" | "emojis">> = {
        keywords: undefined,
        emojis: undefined,
    };

    @computed
    get imageContainer(): UploadedFileContainer<ImageUploadMetadata> | undefined {
        return this.uploadImageStore.imageContainer;
    }

    constructor(private readonly uploadImageStore: UploadImageStore) {
    }

    getEmojiByIndex = createTransformer((index: number) => this.emojis[index]);

    @action
    uploadFile = (file: File): void => {
        this.uploadImageStore.uploadFile(file);
    }

    @action
    addEmoji = (emoji: EmojiData): void => {
        this.emojis.push(emoji);
    }

    @action
    removeEmojiByIndex = (indexToRemove: number): void => {
        this.emojis = this.emojis.filter((_, index) => index !== indexToRemove);
    }

    @action
    addKeyword = (keyword: string): void => {
        this.keywords.push(keyword);
    }

    @action
    removeKeywordByIndex = (indexToRemove: number): void => {
        this.keywords = this.keywords.filter((_, index) => index !== indexToRemove);
    }

    @action
    validate = (): boolean => {
        this.errors = {
            emojis: validateStickerEmojis(this.emojis),
            keywords: validateStickerKeywords(this.keywords),
        };

        return !this.validateFile() && !Boolean(this.errors.emojis || this.errors.keywords);
    }

    private validateFile = (): boolean => {
        if (!this.imageContainer) {
            this.imageValidationError = "sticker.image.required";
        } else {
            this.imageValidationError = this.uploadImageStore.validationError;
        }

        return Boolean(this.imageValidationError);
    }

}
