import {EmojiData} from "emoji-mart";
import {MessageReaction} from "./MessageReaction";

export interface MessageReactionsCount {
    count: number,
    emoji: EmojiData,
    lastReactions: MessageReaction[],
    reactedByCurrentUser: boolean,
    currentUserReaction?: MessageReaction
}
