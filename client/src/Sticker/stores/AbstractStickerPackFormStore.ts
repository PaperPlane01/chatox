import {action, computed, makeObservable, observable, reaction} from "mobx";
import {StickerContainer} from "./StickerContainer";
import {StickerPackFormStore} from "./StickerPackFormStore";
import {validateStickerPackDescription, validateStickerPackName} from "../validation";
import {StickerPackFormData} from "../types";
import {AbstractFormStore} from "../../form-store";
import {FormErrors} from "../../utils/types";
import {swapItems} from "../../utils/array-utils";
import {containsNotUndefinedValues} from "../../utils/object-utils";
import {StickerType} from "../../api/types/response";

export abstract class AbstractStickerPackFormStore<F extends StickerPackFormData> extends AbstractFormStore<F>
	implements StickerPackFormStore<F> {
	createStickerDialogOpen = false;

	editStickerDialogOpen = false;

	editedStickerId?: string = undefined;

	stickersIds: string[] = [];

	stickerUnderCreation?: StickerContainer = undefined;

	stickersType?: StickerType = undefined;

	get stickerContainers(): StickerContainer[] {
		return this.stickersIds.map(stickerId => this.formValues.stickers[stickerId])
	}

	get editedSticker(): StickerContainer | undefined {
		return undefined;
	}

	protected constructor(initialFormValues: F, initialFormErrors: FormErrors<F>) {
		super(initialFormValues, initialFormErrors);

		makeObservable<AbstractStickerPackFormStore<F>>(this, {
			createStickerDialogOpen: observable,
			editStickerDialogOpen: observable,
			editedStickerId: observable,
			stickersIds: observable,
			stickerUnderCreation: observable,
			stickerContainers: computed,
			setCreateStickerDialogOpen: action,
			setEditStickerDialogOpen: action,
			setEditedStickerId: action,
			moveStickerBack: action.bound,
			moveStickerForward: action.bound,
			removeSticker: action.bound,
			initiateStickerCreation: action,
			clearStickerUnderCreation: action,
			reset: action.bound,
			setStickersType: action
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

	reset(): void {
		this.resetForm();
		this.setEditStickerDialogOpen(false);
		this.setEditedStickerId(undefined);
		this.clearStickerUnderCreation();
	}

	initiateStickerCreation = (): void => {
		if (!this.stickersType) {
			return;
		}

		this.stickerUnderCreation = new StickerContainer(this.stickersType);
		this.setCreateStickerDialogOpen(true);
	}

	clearStickerUnderCreation = (): void => {
		this.stickerUnderCreation = undefined;
	}

	clearEditedSticker = (): void => {
		this.setEditedStickerId(undefined);
	}

	removeSticker(stickerId: string, ids?: string[]): void {
		const stickersIds = ids ?? this.stickersIds;

		if (this.formValues.stickers[stickerId]) {
			delete this.formValues.stickers[stickerId];
		}

		const index = stickersIds.indexOf(stickerId);
		stickersIds.splice(index);
	}

	setCreateStickerDialogOpen = (createStickerDialogOpen: boolean): void => {
		this.createStickerDialogOpen = createStickerDialogOpen;
	}

	setEditStickerDialogOpen = (editStickerDialogOpen: boolean): void => {
		this.editStickerDialogOpen = editStickerDialogOpen;
	}

	setStickersType = (stickersType?: StickerType): void => {
		this.stickersType = stickersType;
	}

	setEditedStickerId = (id?: string): void => {
		this.editedStickerId = id;
	}

	moveStickerBack(id: string, ids?: string[]): void {
		const stickersIds = ids ?? this.stickersIds;
		const index = stickersIds.indexOf(id);

		if (index <= 0) {
			return;
		}

		swapItems(stickersIds, index, index - 1);
	}

	moveStickerForward(id: string, ids?: string[]): void {
		const stickersIds = ids ?? this.stickersIds;
		const index = stickersIds.indexOf(id);

		if (index < 0 || index === stickersIds.length - 1) {
			return;
		}

		swapItems(stickersIds, index, index + 1);
	}

	protected validateForm(): boolean {
		this.setFormErrors({
			description: validateStickerPackDescription(this.formValues.description),
			name: validateStickerPackName(this.formValues.name),
			author: undefined,
			stickers: undefined
		} as unknown as FormErrors<F>);
		
		return !containsNotUndefinedValues(this.formErrors) && this.validateStickers();
	}

	protected abstract validateStickers(): boolean

	public abstract addSticker(stickerContainer: StickerContainer): void;

	public abstract editSticker(tickerContainer:StickerContainer): void;
}