import "emoji-mart";

type EmojiSkin = 1 | 2 | 3 | 4 | 5 | 6;

declare module "emoji-mart" {
    export interface EmojiData {
        id: string;
        name: string;
        shortcodes: string;
        emoticons: string[];
        keywords: string[];
        unified: string;
        native: string;
    }

    export function getEmojiDataFromNative(nativeString: string): Promise<EmojiData | undefined>
}
