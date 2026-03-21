import "react";
import {DetailedHTMLProps, HTMLAttributes} from "react";
import type EmojiMart from "emoji-mart";

type EmojiProps = {
    [Key in keyof typeof EmojiMart.Emoji.Props]: typeof EmojiMart.Emoji.Props[Key]["value"] extends never
        ? typeof EmojiMart.Emoji.Props[Key]
        : typeof EmojiMart.Emoji.Props[Key]["value"];
}

declare module "react" {
    namespace JSX {
        interface IntrinsicElements {
            "em-emoji": DetailedHTMLProps<
                Partial<Omit<HTMLElement, keyof EmojiProps>> & Partial<EmojiProps>,
                HTMLAttributes<HTMLElement>
            >
        }
    }
}