import {action, computed, makeObservable, observable, override, reaction, runInAction} from "mobx";
import {AbstractStickerPackFormStore} from "./AbstractStickerPackFormStore";
import {StickerContainer} from "./StickerContainer";
import {StickerPackFormData} from "../types";
import {ApiError, getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {CreateStickerRequest, UpdateStickerPackRequest} from "../../api/types/request";
import {createWithUndefinedValues, isDefined} from "../../utils/object-utils";
import {FormErrors} from "../../utils/types";
import {EntitiesStore} from "../../entities-store";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";

const INITIAL_FORM_VALUES: StickerPackFormData = {
	name: "",
	description: "",
	author: "",
	stickers: {}
};
const INITIAL_FORM_ERRORS: FormErrors<StickerPackFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class UpdateStickerPackStore extends AbstractStickerPackFormStore<StickerPackFormData> {
	stickerPackId?: string = undefined;

	addedStickers = observable.map<string, StickerContainer>();

	addedStickersIds: string[] = [];

	saveAddedStickersPending = false;

	saveAddedStickersError?: ApiError = undefined;

	fetchingStickerPack = false;

	fetchingStickerPackError?: ApiError = undefined;

	get addedStickersContainers(): StickerContainer[] {
		return this.addedStickersIds.map(id => this.addedStickers.get(id)!)
	}

	get editedSticker(): StickerContainer | undefined {
		if (this.editedStickerId) {
			return this.formValues.stickers[this.editedStickerId] ?? this.addedStickers.get(this.editedStickerId);
		}

		return undefined;
	}

	constructor(private readonly entities: EntitiesStore,
				private readonly snackbarService: SnackbarService,
				private readonly localization: LocaleStore) {
		super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

		makeObservable(this, {
			stickerPackId: observable,
			addedStickers: observable,
			addedStickersIds: observable,
			saveAddedStickersPending: observable,
			saveAddedStickersError: observable,
			fetchingStickerPackError: observable,
			fetchingStickerPack: observable,
			addedStickersContainers: computed,
			editedSticker: computed,
			submitForm: action.bound,
			populateFromEntity: action,
			setStickerPackId: action,
			addSticker: action.bound,
			editSticker: action.bound,
			moveStickerBack: override,
			moveStickerForward: override,
			removeSticker: override,
			moveAddedStickerBack: action,
			moveAddedStickerForward: action,
			reset: override,
			resetAddedStickers: action
		});

		reaction(
			() => this.stickerPackId,
			() => this.fetchStickerPack()
		);
	}

	setStickerPackId = (stickerPackId?: string): void => {
		this.stickerPackId = stickerPackId;
	}

	fetchStickerPack = (): void => {
		if (!this.stickerPackId) {
			return;
		}

		const existingStickerPack = this.entities.stickerPacks.findByIdOptional(this.stickerPackId);

		if (isDefined(existingStickerPack)) {
			this.populateFromEntity();
			return;
		}

		this.fetchingStickerPack = true;
		this.fetchingStickerPackError = undefined;

		StickerApi.findStickerPackById(this.stickerPackId)
			.then(({data}) => runInAction(() => {
				this.entities.stickerPacks.insert(data);

				if (data.id === this.stickerPackId) {
					this.populateFromEntity();
				}
			}))
			.catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
			.finally(() => runInAction(() => this.fetchingStickerPack = false));
	}

	populateFromEntity = (): void => {
		if (!this.stickerPackId) {
			return;
		}

		const stickerPack = this.entities.stickerPacks.findById(this.stickerPackId);
		const stickers = this.entities.stickers.findAllById(stickerPack.stickersIds);

		const stickersMap: {[stickerId: string]: StickerContainer} = {};
		const stickersIds: string[] = [];

		stickers.forEach(sticker => {
			const upload = this.entities.uploads.findSticker(sticker.uploadId);
			stickersMap[sticker.id] = new StickerContainer({sticker, upload});
			stickersIds.push(sticker.id);
		});

		this.stickersIds = stickersIds;
		this.setForm({
			name: stickerPack.name,
			author: stickerPack.author,
			description: stickerPack.description,
			stickers: stickersMap
		});
		this.setStickersType(stickerPack.stickersType);
	}

	public addSticker(stickerContainer: StickerContainer): void {
		this.addedStickers.set(stickerContainer.id, stickerContainer);
		this.addedStickersIds.push(stickerContainer.id);
	}

	public editSticker(stickerContainer: StickerContainer): void {
		if (this.formValues.stickers[stickerContainer.id]) {
			this.formValues.stickers[stickerContainer.id] = stickerContainer;
		} else {
			this.addedStickers.set(stickerContainer.id, stickerContainer);
		}
	}

	moveStickerBack(id: string): void {
		if (this.isAddedSticker(id)) {
			this.moveAddedStickerBack(id);
		} else {
			super.moveStickerBack(id);
		}
	}

	moveStickerForward(id: string): void {
		if (this.isAddedSticker(id)) {
			this.moveAddedStickerForward(id);
		} else {
			super.moveStickerForward(id);
		}
	}

	removeSticker(stickerId: string): void {
		if (this.isAddedSticker(stickerId)) {
			this.removeAddedSticker(stickerId);
		} else {
			super.removeSticker(stickerId);
		}
	}

	removeAddedSticker = (addedStickerId: string): void => {
		this.addedStickersIds.splice(this.addedStickersIds.indexOf(addedStickerId));
		this.addedStickers.delete(addedStickerId);
		super.removeSticker(addedStickerId, this.addedStickersIds);
	}

	moveAddedStickerBack = (addedStickerId: string): void => {
		super.moveStickerBack(addedStickerId, this.addedStickersIds);
	}

	moveAddedStickerForward = (addedStickerId: string): void => {
		super.moveStickerForward(addedStickerId, this.addedStickersIds);
	}

	private isAddedSticker = (id: string): boolean => {
		return this.addedStickers.has(id);
	}

	saveAddedStickers = (onComplete?: () => void): void => {
		if (!isDefined(this.stickerPackId) || this.saveAddedStickersPending) {
			return;
		}

		this.saveAddedStickersPending = true;
		this.saveAddedStickersError = undefined;

		const requests: CreateStickerRequest[] = this.addedStickersContainers
			.filter(stickerContainer => isDefined(stickerContainer.uploadContainer?.uploadedFile))
			.map(stickerContainer => ({
				uploadId: stickerContainer.uploadContainer!.uploadedFile!.id,
				emojis: stickerContainer.emojis.map(emoji => emoji.id).filter(isDefined),
				keywords: stickerContainer.keywords
			}));

		const stickerPackId = this.stickerPackId;

		StickerApi.addStickersToStickerPack(stickerPackId, requests)
			.then(({data}) => {
				this.entities.stickers.insertAll(data);
				const stickerPack = this.entities.stickerPacks.findByIdOptional(stickerPackId);

				if (stickerPack) {
					stickerPack.stickersIds.push(...data.map(sticker => sticker.id));
					this.entities.stickerPacks.insertEntity(stickerPack);
					this.populateFromEntity();
				}

				this.resetAddedStickers();

				if (onComplete) {
					onComplete();
				}
			})
			.catch(error => runInAction(() => this.saveAddedStickersError = getInitialApiErrorFromResponse(error)))
			.finally(() => runInAction(() => this.saveAddedStickersPending = false));
	}
	
	public submitForm(): void {
		if (!this.stickerPackId) {
			return;
		}

		if (!this.validateForm()) {
			return;
		}

		if (this.saveAddedStickersPending) {
			return;
		}

		if (this.addedStickers.size !== 0) {
			this.saveAddedStickers(this.submitForm);
			return;
		}

		const stickerPackId = this.stickerPackId;

		this.setPending(true);
		this.setError(undefined);

		const request: UpdateStickerPackRequest = {
			name: this.formValues.name!,
			description: this.formValues.description!,
			author: this.formValues.author,
			stickers: this.stickersIds.map(id => {
				const stickerContainer = this.formValues.stickers[id];

				return {
					id,
					emojis: stickerContainer.emojis.map(emoji => emoji.id).filter(isDefined),
					keywords: stickerContainer.keywords
				}
			})
		};

		StickerApi.updateStickerPack(stickerPackId, request)
			.then(({data}) => {
				this.entities.stickerPacks.insert(data);
				this.snackbarService.enqueueSnackbar(
					this.localization.getCurrentLanguageLabel("sticker.pack.update.success")
				);
			})
			.catch(error => this.setError(getInitialApiErrorFromResponse(error)))
			.finally(() => this.setPending(false));
	}

	reset(): void {
		super.reset();
		this.setStickerPackId(undefined);
		this.resetAddedStickers();
	}

	resetAddedStickers = (): void => {
		this.addedStickers = observable.map();
		this.addedStickersIds = [];
		this.saveAddedStickersPending = false;
		this.saveAddedStickersError = undefined;
	}

	protected validateStickers(): boolean {
		return Object.keys(this.formValues.stickers)
			.map(stickerId => this.formValues.stickers[stickerId].validate())
			.reduce((accumulator, current) => accumulator && current);
	}
}