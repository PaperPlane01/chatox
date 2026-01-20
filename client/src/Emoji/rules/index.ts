import createRegEmojiRegExp from "emoji-regex";

export const NATIVE_EMOJI_REGEXP = createRegEmojiRegExp();

export const COLONS_EMOJI_REGEXP = /:[^:\s]*(?:::[^:\s]*)*:/;

export const EMOJI_REGEXP = new RegExp(`(${NATIVE_EMOJI_REGEXP.source})|(${COLONS_EMOJI_REGEXP.source})`, "g");