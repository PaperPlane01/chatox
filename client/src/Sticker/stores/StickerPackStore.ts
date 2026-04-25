import {ApiError, getInitialApiErrorFromResponse, StickerApi} from "../../api";
import {makeAutoObservable, reaction, runInAction} from "mobx";
import {EntitiesStore} from "../../entities-store";

export class StickerPackStore {
	stickerPackId?: string = undefined;

	pending = false;

	error?: ApiError = undefined;

	constructor(private readonly entities: EntitiesStore) {
		makeAutoObservable(this);

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

		if (existingStickerPack) {
			return;
		}

		this.pending = true;
		this.error = undefined;

		StickerApi.findStickerPackById(this.stickerPackId)
			.then(({data}) => this.entities.stickerPacks.insert(data))
			.catch(error => runInAction(() => this.error = getInitialApiErrorFromResponse(error)))
			.finally(() => runInAction(() => this.pending = false));
	}
}
