import {IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {EmojiSet} from "../../../emoji/types";

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
