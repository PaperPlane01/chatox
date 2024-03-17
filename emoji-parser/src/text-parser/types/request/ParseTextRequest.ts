import {IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {EmojiSet} from "emoji-mart";

export class ParseTextRequest {
    @IsString()
    @IsNotEmpty()
    text: string;

    @IsString()
    @IsNotEmpty()
    @IsIn(["apple", "google", "twitter", "emojione", "messenger", "facebook"])
    emojiSet: EmojiSet;

    @IsBoolean()
    @IsOptional()
    parseColons = false;
}
