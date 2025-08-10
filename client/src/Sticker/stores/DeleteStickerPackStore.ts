import {action, makeObservable, observable, reaction, runInAction} from "mobx";
import {RouterStore} from "mobx-router";
import {InstalledStickerPacksStore} from "./InstalledStickerPacksStore";
import {StickerPackDialogStore} from "./StickerPackDialogStore";
import {StickerPickerStore} from "./StickerPickerStore";
import {DeleteStickerPackFormData} from "../types";
import {AbstractFormStore} from "../../form-store";
import {RouterStoreAware, Routes} from "../../router";
import {containsNotUndefinedValues, createWithUndefinedValues, isDefined} from "../../utils/object-utils";
import {FormErrors} from "../../utils/types";
import {AuthorizationStore} from "../../Authorization";
import {getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {DeleteStickerPackRequest} from "../../api/types/request";
import {EntitiesStore} from "../../entities-store";
import {validateConsent} from "../validation";

const INITIAL_FORM_VALUES: DeleteStickerPackFormData = {
	consent: false,
	deleteMessages: false
};
const INITIAL_FORM_ERRORS: FormErrors<DeleteStickerPackFormData> = createWithUndefinedValues(INITIAL_FORM_VALUES);

export class DeleteStickerPackStore extends AbstractFormStore<DeleteStickerPackFormData> implements RouterStoreAware {
	stickerPackId?: string = undefined;

	deleteStickerPackDialogOpen = false;

	private routerStore: RouterStore<any>;

	constructor(private readonly authorization: AuthorizationStore,
				private readonly entities: EntitiesStore,
				private readonly installedStickerPacks: InstalledStickerPacksStore,
				private readonly stickerPackDialog: StickerPackDialogStore,
				private readonly stickerPicker: StickerPickerStore) {
		super(INITIAL_FORM_VALUES, INITIAL_FORM_ERRORS);

		makeObservable<DeleteStickerPackStore, "validateForm" | "handleStickerPackDeletion">(this, {
			stickerPackId: observable,
			deleteStickerPackDialogOpen: observable,
			setStickerPackId: action,
			setDeleteStickerPackDialogOpen: action,
			submitForm: action.bound,
			validateForm: action.bound,
			handleStickerPackDeletion: action,
			reset: action
		});

		reaction(
			() => this.formValues.consent,
			consent => this.setFormError("consent", validateConsent(consent))
		);
	}

	setRouterStore(routerStore: RouterStore<any>): void {
		this.routerStore = routerStore;
	}

	setStickerPackId = (stickerPackId?: string): void => {
		this.stickerPackId = stickerPackId;
	}

	setDeleteStickerPackDialogOpen = (deleteStickerPackDialogOpen: boolean): void => {
		this.deleteStickerPackDialogOpen = deleteStickerPackDialogOpen;
	}

	submitForm(): void {
		if (!this.stickerPackId) {
			return;
		}

		if (!this.authorization.currentUser) {
			return;
		}

		if (!this.validateForm()) {
			return;
		}

		this.setPending(true);
		this.setError(undefined);

		const request: DeleteStickerPackRequest | undefined = this.authorization.currentUserIsAdmin
			? ({
				deleteMessages: this.formValues.deleteMessages
			})
			: undefined;

		const stickerPackId = this.stickerPackId;

		StickerApi.deleteStickerPack(stickerPackId, request)
			.then(() => runInAction(() => {
				this.handleStickerPackDeletion(stickerPackId, request);
				this.reset();
			}))
			.catch(error => this.setError(getInitialApiErrorFromResponse(error)))
			.finally(() => this.setPending(false));
	}

	protected validateForm(): boolean {
		this.setFormErrors({
			consent: validateConsent(this.formValues.consent),
			deleteMessages: undefined
		});

		return !containsNotUndefinedValues(this.formErrors);
	}

	private handleStickerPackDeletion = (stickerPackId: string, request?: DeleteStickerPackRequest): void => {
		const stickerPack = this.entities.stickerPacks.findByIdOptional(stickerPackId);

		if (!stickerPack) {
			return;
		}

		if (this.routerStore?.currentRoute?.path === Routes.stickerPack.path) {
			this.routerStore.goTo(Routes.stickerPacks);
		}

		if (this.stickerPackDialog.stickerPackId === stickerPackId) {
			this.stickerPackDialog.setStickerPackId(undefined);
		}

		if (this.stickerPicker.selectedStickerPackId === stickerPackId) {
			this.stickerPicker.setSelectedStickerPackId(undefined);
		}

		this.installedStickerPacks.removeInstalledStickerPack(stickerPack.id);
		this.entities.stickerPacks.deleteById(stickerPack.id);

		if (request?.deleteMessages) {
			const messages = this.entities.messages.findAll()
				.filter(message => isDefined(message.stickerId)
					&& stickerPack.stickersIds.includes(message.stickerId));
			this.entities.messages.deleteAllById(messages.map(message => message.id));
			const stickers = this.entities.stickers.findAllById((stickerPack.stickersIds));
			stickers.forEach(sticker => {
				this.entities.stickers.deleteById(sticker.id);
				this.entities.uploads.deleteById(sticker.uploadId);
			});
			this.entities.stickerPacks.deleteAllById(stickerPack.stickersIds);
		}
	}

	reset = (): void => {
		this.setDeleteStickerPackDialogOpen(false);
		this.setStickerPackId(undefined);
		this.resetForm();
	}
}