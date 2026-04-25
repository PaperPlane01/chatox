import {makeAutoObservable} from "mobx";
import {proxy, transfer} from "comlink";
import {chunk} from "lodash";
import {CreateStickerPackStore} from "./CreateStickerPackStore";
import {StickerContainer} from "./StickerContainer";
import {STICKER_PACK_MAX_SIZE} from "../constants";
import {getStageNumber, StickerPackImportStage, StickersMap} from "../types";
import {getStickerPackImportWorker} from "../../workers";
import {ZipImportFile, ZipImportResponse} from "../../workers/types";
import {isDefined} from "../../utils/object-utils";
import {createTuple} from "../../utils/array-utils";
import {StickerType, UploadType} from "../../api/types/response";
import {SnackbarService} from "../../Snackbar";
import {LocaleStore} from "../../localization";

interface LoadFilesOptions {
	zipArchive: File,
	acceptedFormats: string[],
	maxSize: number,
	onLengthReceived?: (length: number) => void,
	onFileReadStarted?: (fileName: string) => void,
	onFileReadEnded?: (fileName: string) => void
}

export class ImportStickerPackStore {
	pending = false;

	stickersType: StickerType | undefined = undefined;

	length?: number = undefined;

	currentStage = StickerPackImportStage.READING_ARCHIVE;

	currentStageProgress = 0;

	currentFileName?: string = undefined;

	get acceptedFormats(): string[] {
		if (!this.stickersType) {
			return [];
		}

		switch (this.stickersType) {
			case UploadType.IMAGE_STICKER:
				return [".png"];
			case UploadType.WEBP_STICKER:
				return [".webp"];
			case UploadType.LOTTIE_STICKER:
				return [".lottie", ".tgs", ".json"];
			case UploadType.VIDEO_STICKER:
			default:
				return [".webm"];
		}
	}

	get currentStageNumber(): number {
		return getStageNumber(this.currentStage);
	}

	get currentStageProgressPercentage(): number {
		if (!this.length) {
			return 0;
		}

		return Math.round(this.currentStageProgress * 100 / this.length);
	}

	constructor(private readonly stickerPackCreation: CreateStickerPackStore,
				private readonly localization: LocaleStore,
				private readonly snackbarService: SnackbarService) {
		makeAutoObservable(this, {}, {autoBind: true});
	}

	setStickersType(stickersType?: StickerType): void {
		this.stickersType = stickersType;
	}

	setLength(length: number): void {
		this.length = length;
	}

	setCurrentFile(fileName: string): void {
		this.currentFileName = fileName
	}

	increaseProgress(number?: number): void {
		this.currentStageProgress = this.currentStageProgress + (number ?? 1);
	}

	resetProgress(): void {
		this.currentStageProgress = 0;
	}

	setCurrentStage(stage: StickerPackImportStage): void {
		this.currentStage = stage;
	}

	reset(): void {
		this.setCurrentStage(StickerPackImportStage.READING_ARCHIVE);
		this.setStickersType(undefined);
		this.resetProgress();
		this.currentFileName = undefined;
		this.length = undefined;
		this.setStickersType(undefined);
		this.stickerPackCreation.reset();
	}

	async importStickerPack(zipArchive: File): Promise<void> {
		if (!isDefined(this.stickersType)) {
			return;
		}
		const stickersType = this.stickersType;

		this.resetProgress();
		this.setCurrentStage(StickerPackImportStage.READING_ARCHIVE);
		const arrayBuffer = await zipArchive.arrayBuffer();
		const {files, rootName} = await this.loadFiles({
			zipArchive: transfer(zipArchive, [arrayBuffer]),
			acceptedFormats: this.acceptedFormats,
			maxSize: STICKER_PACK_MAX_SIZE,
			onLengthReceived: proxy(this.setLength),
			onFileReadStarted: proxy(this.setCurrentFile),
			onFileReadEnded: proxy(() => this.increaseProgress())
		});

		if (files.length === 0) {
			return;
		}

		const filesMap = new Map<string, ZipImportFile>();
		const stickerContainers = files.map(file => {
			const stickerContainer = new StickerContainer(stickersType);
			filesMap.set(stickerContainer.id, file);
			return stickerContainer;
		});
		const stickersMap = await this.uploadStickers(stickerContainers, filesMap);

		this.stickerPackCreation.setStickersType(stickersType);
		this.stickerPackCreation.setStickersIds([...filesMap.keys()]);
		this.stickerPackCreation.setFormValue("stickers", stickersMap);

		if (isDefined(rootName)) {
			this.stickerPackCreation.setFormValue("name", rootName);
		}

		this.stickerPackCreation.setOnStickerPackCreated(this.reset);
		this.setCurrentStage(StickerPackImportStage.CREATING_STICKER_PACK);
	}

	private async loadFiles(options: LoadFilesOptions): Promise<ZipImportResponse> {
		const stickerPackImportWorker = await getStickerPackImportWorker();

		if (!isDefined(stickerPackImportWorker)) {
			return {
				files: []
			};
		}

		try {
			return await stickerPackImportWorker.loadFiles(
				options.zipArchive,
				options.acceptedFormats,
				options.maxSize,
				options.onLengthReceived,
				options.onFileReadStarted,
				options.onFileReadEnded
			);
		} catch (error) {
			console.error(error);
			this.snackbarService.error(
				this.localization.getCurrentLanguageLabel("sticker.pack.import.stage.READING_ARCHIVE.error")
			);
			return {
				files: []
			};
		}
	}

	private async uploadStickers(stickers: StickerContainer[], filesMap: Map<string, ZipImportFile>): Promise<StickersMap> {
		const chunks = chunk(stickers, 5);
		this.resetProgress();
		this.setCurrentStage(StickerPackImportStage.UPLOADING_FILES);
		const stickersMap: StickersMap = {};

		for (const currentChunk of chunks) {
			await Promise.all(
				currentChunk
					.filter(sticker => filesMap.has(sticker.id))
					.map(sticker => createTuple(sticker, filesMap.get(sticker.id)!))
					.map(async ([sticker, stickerFile]) => {
						const fileName = stickerFile.filename;
						this.setCurrentFile(fileName);
						const file = new File([stickerFile.file], fileName);
						stickersMap[sticker.id] = sticker;
						await sticker.uploadFile(file);
						this.increaseProgress();
					})
			);
		}

		return stickersMap;
	}
}