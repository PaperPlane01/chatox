import React from "react";
import Picker from "@emoji-mart/react";
import type EmojiMart from "emoji-mart";

export function EmojiMartPicker<
    T extends keyof typeof EmojiMart.Picker.Props
>(props: Record<T, typeof EmojiMart.Picker.Props[T]["value"]>) {
    return <Picker {...props}/>;
}
