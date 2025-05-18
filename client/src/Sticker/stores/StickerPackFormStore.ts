import {StickerContainer} from "./StickerContainer";
import {StickerPackFormData} from "../types";
import {FormStore} from "../../form-store";

export interface StickerPackFormStore<F extends StickerPackFormData = StickerPackFormData> extends FormStore<F> {
	stickerContainers: StickerContainer[]
	stickerUnderCreation?: StickerContainer
	editedSticker?: StickerContainer
	createStickerDialogOpen: boolean
	editStickerDialogOpen: boolean
	setEditedStickerId(stickerId?: string): void
	clearStickerUnderCreation(): void
	clearEditedSticker(): void
	moveStickerBack(stickerId: string, ids?: string[]): void
	moveStickerForward(stickerId: string, ids?: string[]): void
	removeSticker(stickerId: string, ids?: string[]): void
	setEditedStickerId(stickerId?: string): void
	setCreateStickerDialogOpen(open: boolean): void
	setEditStickerDialogOpen(open: boolean): void
	initiateStickerCreation(): void
	addSticker(stickerContainer: StickerContainer): void
	editSticker(stickerContainer: StickerContainer): void
}
