import {makeAutoObservable, reaction, runInAction} from "mobx";
import {unionBy} from "lodash";
import {EmojiData, getEmojiDataFromNative} from "emoji-mart";
import {CreateMessageStore} from "./CreateMessageStore";
import {StickerEntity} from "../../Sticker/types";
import {InstalledStickerPacksStore} from "../../Sticker/stores";
import {StickerRepository} from "../../Sticker/repositories";
import {KEYWORD_MAX_LENGTH} from "../../StickerPackForm/constants";
import {EMOJI_REGEXP} from "../../Emoji/rules";
import {getEmojiDataFromColons} from "../../Emoji/utils";
import {RawEntitiesStore} from "../../entities-store";
import {Repositories} from "../../repositories";
import {isStringEmpty} from "../../utils/string-utils";
import {isDefined} from "../../utils/object-utils";

export class StickerSuggestionsStore {
	stickersIds: string[] = [];

	pending = false;

	constructor(private readonly installedStickerPacks: InstalledStickerPacksStore,
				private readonly messageCreation: CreateMessageStore,
				private readonly rawEntities: RawEntitiesStore,
				private readonly repositories: Repositories) {
		makeAutoObservable(this, {}, {autoBind: true});

		reaction(
			() => this.messageCreation.formValues.text,
			text => this.loadSuggestions(text)
		);
	}

	async loadSuggestions(text: string): Promise<void> {
		if (isStringEmpty(text) || text.length > KEYWORD_MAX_LENGTH) {
			this.stickersIds = [];
			return;
		}

		const repository = this.repositories.getRepository("stickers");

		if (!repository) {
			return;
		}

		this.pending = true;

		const [stickersByKeywords, stickersByEmoji] = await Promise.all(
			[
				repository.findByKeyword(text, this.installedStickerPacks.installedStickerPacksIds),
				this.findStickersByEmoji(text, repository)
			]
		);
		const stickers = unionBy(stickersByKeywords, stickersByEmoji, sticker => sticker.id);
		const entitiesPatch = await repository.restoreEntityPatchForEntities(stickers);

		runInAction(() => {
			this.rawEntities.applyPatch(entitiesPatch, true);
			this.stickersIds = stickers.map(sticker => sticker.id);
			this.pending = false;
		});
	}

	private async findStickersByEmoji(text: string, repository: StickerRepository): Promise<Array<StickerEntity>> {
		if (!EMOJI_REGEXP.test(text)) {
			return [];
		}

        let emojiData: EmojiData | undefined;

		if (text.startsWith(":")) {
			emojiData = await getEmojiDataFromColons(text);
		} else {
			emojiData = await getEmojiDataFromNative(text);
		}

		if (!isDefined(emojiData?.id)) {
			return [];
		}

		return repository.findByEmojiId(emojiData.id, this.installedStickerPacks.installedStickerPacksIds);
	}
}
