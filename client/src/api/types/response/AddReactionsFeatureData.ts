import {ChatFeatureData} from "./ChatFeatureData";
import {EmojiDataResponse} from "./EmojiDataResponse";

export type AddReactionsFeatureData = ChatFeatureData<{
    allowedEmojis: EmojiDataResponse[]
}>;
