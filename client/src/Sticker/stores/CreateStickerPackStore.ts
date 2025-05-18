import {action, computed, makeObservable, reaction} from "mobx";
import {RouterStore} from "mobx-router";
import {AbstractStickerPackFormStore} from "./AbstractStickerPackFormStore";
import {StickerContainer} from "./StickerContainer";
import {CreateStickerPackFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {CreateStickerRequest} from "../../api/types/request";
import {getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {createWithUndefinedValues, isDefined} from "../../utils/object-utils";
import {RouterStoreAware, Routes} from "../../router";
import {LocaleStore} from "../../localization";
import {SnackbarService} from "../../Snackbar";

const INITIAL_FORM_VALUES: CreateStickerPackFormData = {
    name: "",
    description: "",
    author: "",
    stickersType: undefined,
    stickers: {}
};
const INITIAL_FORM_ERRORS: FormErrors<CreateStickerPackFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class CreateStickerPackStore extends AbstractStickerPackFormStore<CreateStickerPackFormData>
    implements RouterStoreAware {
    get editedSticker(): StickerContainer | undefined {
        if (this.editedStickerId) {
            return this.formValues.stickers[this.editedStickerId];
        }

        return undefined;
    }

    private routerStore?: RouterStore<any> = undefined;

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

        reaction(
            () => this.formValues.stickersType,
            stickersType => this.setStickersType(stickersType)
        );
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

    public submitForm(): void {
        if (!this.formValues.stickersType || !this.validateForm()) {
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
            stickersType: this.formValues.stickersType,
            stickers
        })
            .then(({data}) => {
                this.entities.stickerPacks.insert(data);
                this.snackbarService.enqueueSnackbar(
                    this.locale.getCurrentLanguageLabel("sticker.pack.create.success")
                );

                if (this.routerStore) {
                    this.routerStore.goTo(Routes.stickerPack, {id: data.id});
                }

                this.reset();
            })
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
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
