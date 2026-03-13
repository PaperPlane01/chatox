import "emoji-mart";

type EmojiSkin = 1 | 2 | 3 | 4 | 5 | 6;

declare module "emoji-mart" {
    export interface EmojiData {
        id: string;
        name: string;
        colons: string;
        emoticons: string[];
        unified: string;
        skin: EmojiSkin | null;
        native: string;
    }

    export function getEmojiDataFromNative(nativeString: string): Promise<EmojiData | undefined>
}
