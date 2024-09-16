import createEmojiRegExp from "emoji-regex";

export const EMOJI_COLONS = /:[^:\s]*(?:::[^:\s]*)*:$/g;

export const EMOJI_NATIVE = createEmojiRegExp();

export const USER_LINK = /\[[^\]]*]\(\/user\/[^)]*\)/g;
