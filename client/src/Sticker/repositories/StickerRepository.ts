import {StickerEntity, StickerRelationships} from "../types";
import {Repository} from "../../repository";

export interface StickerRepository extends Repository<StickerEntity, StickerRelationships> {
	findByStickerPack(stickerPackId: string): Promise<Array<StickerEntity>>
	findByStickerPackIdIn(stickerPacksIds: string[]): Promise<Array<StickerEntity>>
	findByKeyword(keyword: string, stickerPacksIds: string[]): Promise<Array<StickerEntity>>
	findByEmojiId(emojiId: string, stickerPacksIds: string[]): Promise<Array<StickerEntity>>
}
