import {action, computed, makeObservable, observable, reaction} from "mobx";
import {StickerContainer} from "./StickerContainer";
import {CreateStickerPackFormData} from "../types";
import {validateStickerPackDescription, validateStickerPackName} from "../validation";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {CreateStickerRequest} from "../../api/types/request";
import {getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {containsNotUndefinedValues, isDefined} from "../../utils/object-utils";
import {swapItems} from "../../utils/array-utils";

const INITIAL_FORM_VALUES: CreateStickerPackFormData = {
    name: "",
    description: "",
    author: "",
    stickersType: undefined,
    stickers: {}
};
const INITIAL_FORM_ERRORS: FormErrors<CreateStickerPackFormData> = {
    name: undefined,
    description: undefined,
    author: undefined,
    stickers: undefined,
    stickersType: undefined
};

export class CreateStickerPackStore extends AbstractFormStore<CreateStickerPackFormData> {
    stickerDialogOpen = false;

    editedStickerId?: string = undefined;

    stickerUnderCreation?: StickerContainer = undefined;

    stickersIds: string[] = [];

    get stickerContainers(): StickerContainer[] {
        return this.stickersIds.map(stickerLocalId => this.formValues.stickers[stickerLocalId])
    }

    constructor(private readonly entities: EntitiesStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        makeObservable<CreateStickerPackStore, "validateForm">(this, {
            stickerDialogOpen: observable,
            editedStickerId: observable,
            stickerUnderCreation: observable,
            stickersIds: observable,
            stickerContainers: computed,
            initiateStickerCreation: action,
            clearStickerUnderCreation: action,
            addSticker: action,
            removeSticker: action,
            setStickerDialogOpen: action,
            setEditedStickerId: action,
            submitForm: action.bound,
            validateForm: action.bound
        });

        reaction(
            () => this.formValues.name,
            name => this.setFormError("name", validateStickerPackName(name))
        );

        reaction(
            () => this.formValues.description,
            description => this.setFormError("description", validateStickerPackDescription(description))
        );
    }

    reset = (): void => {
        this.resetForm();
        this.setStickerDialogOpen(false);
        this.setEditedStickerId(undefined);
        this.clearStickerUnderCreation();
    }

    initiateStickerCreation = (): void => {
        if (!this.formValues.stickersType) {
            return;
        }

        this.stickerUnderCreation = new StickerContainer(this.formValues.stickersType);
        this.setStickerDialogOpen(true);
    }

    clearStickerUnderCreation = (): void => {
        this.stickerUnderCreation = undefined;
    }

    addSticker = (sticker: StickerContainer): void => {
        this.formValues.stickers[sticker.localId] = sticker;

        if (!this.stickersIds.includes(sticker.localId)) {
            this.stickersIds.push(sticker.localId);
        }
    }

    removeSticker = (stickerId: string): void => {
        delete this.formValues.stickers[stickerId];
        this.stickersIds.splice(this.stickersIds.indexOf(stickerId));
    }

    setStickerDialogOpen = (stickerDialogOpen: boolean): void => {
        this.stickerDialogOpen = stickerDialogOpen;
    }

    setEditedStickerId = (id?: string): void => {
        this.editedStickerId = id;
    }

    moveStickerBack = (id: string): void => {
        const index = this.stickersIds.indexOf(id);

        if (index <= 0) {
            return;
        }

        swapItems(this.stickersIds, index, index - 1);
    }

    moveStickerForward = (id: string): void => {
        const index = this.stickersIds.indexOf(id);

        if (index < 0 || index === this.stickersIds.length - 1) {
            return;
        }

        swapItems(this.stickersIds, index, index + 1);
    }

    public submitForm(): void {
        if (!this.formValues.stickersType || !this.validateForm()) {
            return;
        }

        const stickers: CreateStickerRequest[] = Object.keys(this.formValues.stickers)
            .map(localStickerId => this.formValues.stickers[localStickerId])
            .filter(stickerContainer => isDefined(stickerContainer.uploadContainer?.uploadedFile))
            .map(stickerContainer => ({
                emojis: stickerContainer.emojis,
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
            .then(({data}) => this.entities.stickerPacks.insert(data))
            .catch(error => this.setError(getInitialApiErrorFromResponse(error)))
            .finally(() => this.setPending(false));
    }

    protected validateForm(): boolean {
        this.formErrors = {
            description: validateStickerPackDescription(this.formValues.description),
            name: validateStickerPackName(this.formValues.name),
            author: undefined,
            stickers: undefined,
            stickersType: undefined
        };
        const filesContainErrors = Object.keys(this.formValues.stickers)
            .map(localStickerId => Boolean(!this.formValues.stickers[localStickerId].validate()
                || this.formValues.stickers[localStickerId].fileValidationError
                || this.formValues.stickers[localStickerId]?.uploadContainer?.error)
            )
            .reduce((accumulator, current) => accumulator && current);

        return !containsNotUndefinedValues(this.formErrors) && !filesContainErrors;
    }
}
