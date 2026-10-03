import {EmojiData} from "emoji-mart";

export interface MessageEntityReactionsCount {
    emoji: EmojiData,
    count: number,
    lastReactions: string[],
    reactedByCurrentUser: boolean,
    currentUserReactionId?: string
}
