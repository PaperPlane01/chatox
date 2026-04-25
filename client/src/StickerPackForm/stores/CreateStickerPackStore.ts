import {action, computed, makeObservable} from "mobx";
import {RouterStore} from "mobx-router";
import {AbstractStickerPackFormStore} from "./AbstractStickerPackFormStore";
import {StickerContainer} from "./StickerContainer";
import {StickerPackFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {CreateStickerRequest} from "../../api/types/request";
import {getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {createWithUndefinedValues, isDefined} from "../../utils/object-utils";
import {RouterStoreAware, Routes} from "../../router";
import {LocaleStore} from "../../localization";
import {SnackbarService} from "../../Snackbar";
import {StickerPackEntity} from "../../Sticker";

const INITIAL_FORM_VALUES: StickerPackFormData = {
    name: "",
    description: "",
    author: "",
    stickers: {}
};
const INITIAL_FORM_ERRORS: FormErrors<StickerPackFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class CreateStickerPackStore extends AbstractStickerPackFormStore<StickerPackFormData>
    implements RouterStoreAware {
    get editedSticker(): StickerContainer | undefined {
        if (this.editedStickerId) {
            return this.formValues.stickers[this.editedStickerId];
        }

        return undefined;
    }

    private routerStore?: RouterStore<any> = undefined;
    private onStickerPackCreated?: (stickerPack: StickerPackEntity) => void;

    constructor(private readonly entities: EntitiesStore,
                private readonly locale: LocaleStore,
                private readonly snackbarService: SnackbarService) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        makeObservable<CreateStickerPackStore>(this, {
            editedSticker: computed,
            submitForm: action.bound,
            addSticker: action.bound,
            editSticker: action.bound,
        });
    }

    addSticker(sticker: StickerContainer): void {
        this.formValues.stickers[sticker.id] = sticker;

        if (!this.stickersIds.includes(sticker.id)) {
            this.stickersIds.push(sticker.id);
        }
    }

    editSticker(sticker: StickerContainer): void {
        this.addSticker(sticker);
    }

    setOnStickerPackCreated(onStickerPackCreated?: (stickerPack: StickerPackEntity) => void): void {
        this.onStickerPackCreated = onStickerPackCreated;
    }

    public submitForm(): void {
        if (!this.stickersType || !this.validateForm()) {
            return;
        }

        const stickers: CreateStickerRequest[] = Object.keys(this.formValues.stickers)
            .map(localStickerId => this.formValues.stickers[localStickerId])
            .filter(stickerContainer => isDefined(stickerContainer.uploadContainer?.uploadedFile))
            .map(stickerContainer => ({
                emojis: stickerContainer.emojis.map(emoji => emoji.id).filter(isDefined),
                uploadId: stickerContainer.uploadContainer!.uploadedFile!.id,
                keywords: stickerContainer.keywords
            }));

        this.pending = true;
        this.error = undefined;

        StickerApi.createStickerPack({
            name: this.formValues.name!,
            author: this.formValues.author,
            description: this.formValues.description!,
            stickersType: this.stickersType,
            stickers
        })
            .then(({data}) => {
                const stickerPack = this.entities.stickerPacks.insert(data);
                this.snackbarService.enqueueSnackbar(
                    this.locale.getCurrentLanguageLabel("sticker.pack.create.success")
                );

                if (this.routerStore) {
                    this.routerStore.goTo(Routes.stickerPack, {id: data.id});
                }

                this.onStickerPackCreated?.(stickerPack);
                this.reset();
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    reset() {
        super.reset();
        this.onStickerPackCreated = undefined;
    }

    protected validateStickers(): boolean {
        return Object.keys(this.formValues.stickers)
            .map(localStickerId => this.formValues.stickers[localStickerId].validate()
                && !isDefined(this.formValues.stickers[localStickerId].fileValidationError)
                && !isDefined(this.formValues.stickers[localStickerId]?.uploadContainer?.error)
            )
            .reduce((accumulator, current) => accumulator && current);
    }

    setRouterStore = (routerStore: RouterStore<any>): void => {
        this.routerStore = routerStore;
    }
}
