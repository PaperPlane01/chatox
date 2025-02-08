import {makeAutoObservable, runInAction} from "mobx";
import {computedFn} from "mobx-utils";
import {v4} from "uuid";
import {EmojiData} from "emoji-mart";
import {AxiosPromise} from "axios";
import {validateStickerEmojis, validateStickerKeywords} from "../validation";
import {getMaxFileSize, UploadedFileContainer} from "../../utils/file-utils";
import {StickerType, StickerUploadMetadata, Upload, UploadType} from "../../api/types/response";
import {FormErrors} from "../../utils/types";
import {Labels} from "../../localization";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {ApiError, getInitialApiErrorFromResponse, ProgressCallback, UploadApi} from "../../api";

export class StickerContainer {
    localId = v4();

    keywords: string[] = [];

    emojis: EmojiData[] = [];

    fileValidationError?: keyof Labels = undefined;

    errors: FormErrors<Pick<StickerContainer, "keywords" | "emojis">> = {
        keywords: undefined,
        emojis: undefined,
    };

    uploadContainer: UploadedFileContainer<StickerUploadMetadata> | undefined = undefined;

    get acceptedFiles(): string {
        return this.stickerType === UploadType.IMAGE_STICKER ? "image/png" : "image/webp";
    }

    get pending(): boolean {
        return this.uploadContainer?.pending ?? false;
    }

    get submissionError(): ApiError | undefined {
        return this.uploadContainer?.error;
    }

    constructor(readonly stickerType: StickerType) {
        makeAutoObservable(this);
    }

    getEmojiByIndex = computedFn((index: number) => this.emojis[index]);

    uploadFile = (file: File): void => {
        this.uploadContainer = new UploadedFileContainer(file, this.stickerType)

        if (!this.validateFile()) {
            return;
        }

        this.uploadContainer.pending = true;
        const uploadFunction = this.getUploadFunction();

        uploadFunction(file, this.updateProgress)
            .then(({data}) => runInAction(() => {
                if (this.uploadContainer) {
                    this.uploadContainer.uploadedFile = data;
                }
            }))
            .catch(error => runInAction(() => {
                if (this.uploadContainer) {
                    this.uploadContainer.error = getInitialApiErrorFromResponse(error);
                }
            }))
            .finally(() => runInAction(() => {
                if (this.uploadContainer) {
                    this.uploadContainer.pending = false;
                }
            }))
    }

    private updateProgress = (progress: number): void => {
        runInAction(() => {
            if (this.uploadContainer) {
                this.uploadContainer.uploadPercentage = progress;
            }
        })
    }

    private getUploadFunction(): (upload: File, progressCallback?: ProgressCallback) => AxiosPromise<Upload<StickerUploadMetadata>> {
        if (this.stickerType === UploadType.IMAGE_STICKER) {
            return UploadApi.uploadImageSticker;
        } else {
            return UploadApi.uploadWebpSticker;
        }
    }

    addEmoji = (emoji: EmojiData): void => {
        this.emojis.push(emoji);
    }

    removeEmojiByIndex = (indexToRemove: number): void => {
        this.emojis = this.emojis.filter((_, index) => index !== indexToRemove);
    }

    addKeyword = (keyword: string): void => {
        this.keywords.push(keyword);
    }

    removeKeywordByIndex = (indexToRemove: number): void => {
        this.keywords = this.keywords.filter((_, index) => index !== indexToRemove);
    }

    validate = (): boolean => {
        this.errors = {
            emojis: validateStickerEmojis(this.emojis),
            keywords: validateStickerKeywords(this.keywords),
        };

        return this.validateFile() && !containsNotUndefinedValues(this.errors);
    }

    private validateFile = (): boolean => {
        if (!this.uploadContainer) {
            this.fileValidationError = "sticker.file.required";
        }

        const maxSize = getMaxFileSize(this.stickerType);

        if (this.uploadContainer?.file && this.uploadContainer.file.size > maxSize) {
            this.fileValidationError = "sticker.file.too-large";
        }

        return !Boolean(this.fileValidationError);
    }

}
