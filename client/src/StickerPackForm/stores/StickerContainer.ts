import {makeAutoObservable, runInAction} from "mobx";
import {v4} from "uuid";
import {EmojiData} from "emoji-mart";
import {AxiosError, AxiosPromise} from "axios";
import {validateStickerEmojis, validateStickerKeywords} from "../validation";
import {StickerEntity} from "../../Sticker";
import {getMaxFileSize, UploadedFileContainer} from "../../utils/file-utils";
import {ApiError, getInitialApiErrorFromResponse, ProgressCallback, UploadApi} from "../../api";
import {StickerType, StickerUploadMetadata, Upload, UploadType} from "../../api/types/response";
import {FormErrors} from "../../utils/types";
import {Labels} from "../../localization";
import {containsNotUndefinedValues} from "../../utils/object-utils";

interface StickerContainerOptions {
    sticker: StickerEntity,
    upload: Upload<StickerUploadMetadata>
}

export class StickerContainer {
    id = v4();

    keywords: string[] = [];

    emojis: EmojiData[] = [];

    fileValidationError?: keyof Labels = undefined;

    errors: FormErrors<Pick<StickerContainer, "keywords" | "emojis">> = {
        keywords: undefined,
        emojis: undefined,
    };

    uploadContainer: UploadedFileContainer<StickerUploadMetadata> | undefined = undefined;

    stickerType: StickerType;

    get acceptedFiles(): string {
        switch (this.stickerType) {
            case UploadType.IMAGE_STICKER:
                return "image/png";
            case UploadType.WEBP_STICKER:
                return "image/webp";
            case UploadType.VIDEO_STICKER:
                return ".webm";
            case UploadType.LOTTIE_STICKER:
            default:
                return ".lottie,.tgs,.json";
        }
    }

    get pending(): boolean {
        return this.uploadContainer?.pending ?? false;
    }

    get submissionError(): ApiError | undefined {
        return this.uploadContainer?.error;
    }

    constructor(options: StickerType | StickerContainerOptions) {
        makeAutoObservable(this, {}, {autoBind: true});

        if (typeof options === "string") {
            this.stickerType = options;
        } else {
            const {sticker, upload} = options;
            this.id = sticker.id;
            this.keywords = sticker.keywords;
            this.emojis = sticker.emojiIds.map(emojiId => sticker.emojis[emojiId]);
            this.stickerType = upload.type as unknown as StickerType;
            this.uploadContainer = new UploadedFileContainer(
                undefined,
                this.stickerType,
                false,
                upload.id,
                upload
            );
        }
    }

    async uploadFile(file: File): Promise<void> {
        this.uploadContainer = new UploadedFileContainer(file, this.stickerType)

        if (!this.validateFile()) {
            return;
        }

        this.uploadContainer.pending = true;
        const uploadFunction = this.getUploadFunction();

        try {
            const {data} = await uploadFunction(file, this.updateProgress);
            runInAction(() => {
                if (this.uploadContainer) {
                    this.uploadContainer.uploadedFile = data;
                }
            });
        } catch (error) {
            runInAction(() => {
                if (this.uploadContainer) {
                    this.uploadContainer.error = getInitialApiErrorFromResponse(error as AxiosError);
                }
            });
        } finally {
           runInAction(() => {
               if (this.uploadContainer) {
                   this.uploadContainer.pending = false;
               }
           })
        }
    }

    private updateProgress(progress: number): void {
        runInAction(() => {
            if (this.uploadContainer) {
                this.uploadContainer.uploadPercentage = progress;
            }
        });
    }

    private getUploadFunction(): (upload: File, progressCallback?: ProgressCallback) => AxiosPromise<Upload<StickerUploadMetadata>> {
        switch (this.stickerType) {
            case UploadType.IMAGE_STICKER:
                return UploadApi.uploadImageSticker;
            case UploadType.VIDEO_STICKER:
                return UploadApi.uploadVideoSticker;
            case UploadType.LOTTIE_STICKER:
                return UploadApi.uploadLottieSticker;
            case UploadType.WEBP_STICKER:
            default:
                return UploadApi.uploadWebpSticker;
        }
    }

    addEmoji(emoji: EmojiData): void {
        this.emojis.push(emoji);
    }

    removeEmojiByIndex(indexToRemove: number): void {
        this.emojis = this.emojis.filter((_, index) => index !== indexToRemove);
    }

    addKeyword(keyword: string): void {
        this.keywords.push(keyword);
    }

    removeKeywordByIndex(indexToRemove: number): void {
        this.keywords = this.keywords.filter((_, index) => index !== indexToRemove);
    }

    validate(): boolean {
        this.errors = {
            emojis: validateStickerEmojis(this.emojis),
            keywords: validateStickerKeywords(this.keywords),
        };

        return this.validateFile() && !containsNotUndefinedValues(this.errors);
    }

    private validateFile(): boolean {
        if (!this.uploadContainer) {
            this.fileValidationError = "sticker.file.required";
        }

        const maxSize = getMaxFileSize(this.stickerType);

        if (this.uploadContainer?.file && this.uploadContainer.file.size > maxSize) {
            this.fileValidationError = "sticker.file.too-large";
        }

        return !this.fileValidationError;
    }

}
