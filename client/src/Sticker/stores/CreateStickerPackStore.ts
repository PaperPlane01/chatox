import {action, computed, makeObservable, observable, reaction} from "mobx";
import {StickerContainer} from "./StickerContainer";
import {CreateStickerPackFormData} from "../types";
import {validateStickerPackDescription, validateStickerPackName} from "../validation";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {CreateStickerRequest} from "../../api/types/request";
import {getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {EntitiesStore} from "../../entities-store";
import {UploadImageStore} from "../../Upload";

const INITIAL_FORM_VALUES: CreateStickerPackFormData = {
    name: "",
    description: "",
    author: "",
    stickers: {}
};
const INITIAL_FORM_ERRORS: FormErrors<CreateStickerPackFormData> = {
    name: undefined,
    description: undefined,
    author: undefined,
    stickers: undefined
};

export class CreateStickerPackStore extends AbstractFormStore<CreateStickerPackFormData> {
    stickerDialogOpen = false;

    editedStickerId?: string = undefined;

    stickerUnderCreation?: StickerContainer = undefined;

    get stickerContainers(): StickerContainer[] {
        return Object.keys(this.formValues.stickers).map(stickerLocalId => this.formValues.stickers[stickerLocalId])
    }

    constructor(private readonly entities: EntitiesStore) {
        super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

        makeObservable<CreateStickerPackStore, "validateForm">(this, {
            stickerDialogOpen: observable,
            editedStickerId: observable,
            stickerUnderCreation: observable,
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

    initiateStickerCreation = (): void => {
        this.stickerUnderCreation = new StickerContainer(new UploadImageStore(this.entities));
        this.setStickerDialogOpen(true);
    };

    clearStickerUnderCreation = (): void => {
        this.stickerUnderCreation = undefined;
    };

    addSticker = (sticker: StickerContainer): void => {
        this.formValues.stickers[sticker.localId] = sticker;
    };

    removeSticker = (stickerId: string): void => {
        delete this.formValues.stickers[stickerId];
    };

    setStickerDialogOpen = (stickerDialogOpen: boolean): void => {
        this.stickerDialogOpen = stickerDialogOpen;
    };

    setEditedStickerId = (id?: string): void => {
        this.editedStickerId = id;
    };

    public submitForm(): void {
        if (!this.validateForm()) {
            return;
        }

        const stickers: CreateStickerRequest[] = Object.keys(this.formValues.stickers)
            .map(localStickerId => this.formValues.stickers[localStickerId])
            .filter(stickerContainer => Boolean(stickerContainer.imageContainer && stickerContainer.imageContainer.uploadedFile))
            .map(stickerContainer => ({
                emojis: stickerContainer.emojis,
                imageId: stickerContainer.imageContainer!.uploadedFile!.id,
                keywords: stickerContainer.keywords
            }));

        this.pending = true;
        this.error = undefined;

        StickerApi.createStickerPack({
            name: this.formValues.name!,
            author: this.formValues.author,
            description: this.formValues.description!,
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
            stickers: undefined
        };
        const filesContainErrors = Object.keys(this.formValues.stickers)
            .map(localStickerId => Boolean(!this.formValues.stickers[localStickerId].validate()
                || this.formValues.stickers[localStickerId].imageValidationError
                || this.formValues.stickers[localStickerId].imageContainer?.error)
            )
            .reduce((accumulator, current) => accumulator && current);

        return !Boolean(this.formErrors.description || this.formErrors.name || this.formErrors.author || filesContainErrors);
    }
}
