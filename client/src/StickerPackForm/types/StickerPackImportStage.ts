export enum StickerPackImportStage {
	READING_ARCHIVE = "READING_ARCHIVE",
	UPLOADING_FILES = "UPLOADING_FILES",
	CREATING_STICKER_PACK = "CREATING_STICKER_PACK"
}

const NUMBERED_STAGES = new Map<StickerPackImportStage, number>([
	[StickerPackImportStage.READING_ARCHIVE, 0],
	[StickerPackImportStage.UPLOADING_FILES, 1],
	[StickerPackImportStage.CREATING_STICKER_PACK, 2]
]);

export const getStageNumber = (stage: StickerPackImportStage): number => NUMBERED_STAGES.get(stage) ?? 0;
