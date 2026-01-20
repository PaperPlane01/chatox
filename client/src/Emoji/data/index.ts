import _allEmojiData from "emoji-mart/data/apple.json";
import {uncompress} from "emoji-mart/dist-es/utils/data";

const _emojiData = _allEmojiData;

uncompress(_emojiData);

export const emojiData = _emojiData;

export const allEmojiData = _allEmojiData;
