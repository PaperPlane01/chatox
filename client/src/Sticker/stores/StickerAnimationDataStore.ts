import {makeAutoObservable, observable, reaction} from "mobx";
import {computedFn} from "mobx-utils";
import type {StickerPickerStore} from "./StickerPickerStore";
import {StickerAnimationData} from "../types";
import {ExpirableStore} from "../../expirable-store";
import {isLottieSticker, TimeUnit} from "../../api/types/response";
import {Duration} from "../../utils/date-utils";
import {Repositories} from "../../repositories";
import {getDotLottieZipWorker} from "../../workers";
import type {EntitiesStore, ReferencedEntitiesStore} from "../../entities-store";
import {isDefined} from "../../utils/object-utils";

export class StickerAnimationDataStore {
	animationData = new ExpirableStore<string, string>(
		Duration.of(30, TimeUnit.MINUTES),
		id => {
			if (this.entityReferences.isEntityReferenced("stickers", id)) {
				return false;
			}

			this.handleStickerExpiration(id);
			return true;
		}
	);
	cachedStickerPacks = observable.map<string, boolean>();

	stickerPicker?: StickerPickerStore;

	constructor(private readonly entities: EntitiesStore,
				private readonly entityReferences: ReferencedEntitiesStore,
				private readonly repositories: Repositories) {
		makeAutoObservable(
			this,
			{animationData: false},
			{autoBind: true}
		);

		reaction(
			() => this.stickerPicker?.selectedStickerPackId,
			stickerPackId => isDefined(stickerPackId)
				&& this.loadAnimationDataForStickerPack(stickerPackId)
		);
	}

	setStickerPicker(stickerPicker: StickerPickerStore): void {
		this.stickerPicker = stickerPicker;
	}

	async loadAnimationDataForStickerPack(stickerPackId: string): Promise<void> {
		if (this.cachedStickerPacks.get(stickerPackId) ?? false) {
			return;
		}

		const stickerPack = this.entities.stickerPacks.findByIdOptional(stickerPackId);

		if (!isDefined(stickerPack) || !isLottieSticker(stickerPack.stickersType)) {
			return;
		}

		const stickerAnimationDataRepository = this.repositories.getRepository("stickerAnimationData");

		if (!isDefined(stickerAnimationDataRepository)) {
			return;
		}

		const dotLottieZipWorker = await getDotLottieZipWorker();

		if (!isDefined(dotLottieZipWorker)) {
			return;
		}

		const animationDataMap = new Map<string, StickerAnimationData>(
			(await stickerAnimationDataRepository.findAllById(stickerPack.stickersIds))
				.map(animationData => [animationData.id, animationData])
		);
		const missingStickers = stickerPack.stickersIds.filter(stickerId => !animationDataMap.has(stickerId));

		for (const stickerId of missingStickers) {
			const sticker = this.entities.stickers.findById(stickerId);
			const upload = this.entities.uploads.findById(sticker.uploadId);
			const animationData = await dotLottieZipWorker.getLottieAnimation(upload.uri);

			if (isDefined(animationData)) {
				animationDataMap.set(
					stickerId,
					{
						id: stickerId,
						animationData
					}
				);
				stickerAnimationDataRepository.upsert({
					id: stickerId,
					animationData
				});
			}
		}

		animationDataMap.forEach(({id, animationData}) => this.setAnimationData(id, animationData));
		this.cachedStickerPacks.set(stickerPackId, true);
	}

	async deleteAnimationDataForStickerPack(stickerPackId: string): Promise<void> {
		const stickerAnimationDataRepository = this.repositories.getRepository("stickerAnimationData");

		if (!isDefined(stickerAnimationDataRepository)) {
			return;
		}

		const stickerPack = this.entities.stickerPacks.findByIdOptional(stickerPackId);

		if (!isDefined(stickerPack) || !isLottieSticker(stickerPack.stickersType)) {
			return;
		}

		this.cachedStickerPacks.delete(stickerPackId);
		await stickerAnimationDataRepository.deleteAllByIds(stickerPack.stickersIds);
	}

	setAnimationData(id: string, animationData: string): void {
		this.animationData.set(id, animationData);
	}

	getAnimationData = computedFn((id: string): string | undefined => {
		return this.animationData.get(id);
	})

	handleStickerExpiration(stickerId: string): void {
		const sticker = this.entities.stickers.findById(stickerId);
		this.cachedStickerPacks.delete(sticker.stickerPackId);
	}
}
