import {computedFn} from "mobx-utils";
import {StickerPackEntity} from "../types";
import {AuthorizationStore} from "../../Authorization";

export class StickerPackPermissions {
	constructor(private readonly authorization: AuthorizationStore) {
	}

	canEditStickerPack = computedFn((stickerPack: StickerPackEntity): boolean => {
		return this.authorization.currentUser?.id === stickerPack.createdById;
	})
}
