import createEmojiRegExp from "emoji-regex";

export const EMOJI_COLONS = /:[^:\s]*(?:::[^:\s]*)*:/;

export const EMOJI_NATIVE = createEmojiRegExp();

export const USER_LINK = /\[[^\]]*]\(\/user\/[^)]*\)/;

export const ANYTHING = /./;
