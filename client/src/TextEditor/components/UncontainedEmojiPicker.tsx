import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {EmojiData} from "emoji-mart";
import {LexicalEditor} from "lexical";
import {ADD_EMOJI} from "../commands";
import {EmojiAndStickerPicker, EmojiPicker, EmojiPickerVariant} from "../../EmojiPicker";
import {isDefined} from "../../utils/object-utils";

interface UncontainedEmojiPickerProps {
	variant: EmojiPickerVariant,
	emojiPickerExpanded?: boolean,
	editor?: LexicalEditor,
	setEmojiPickerExpanded?: (emojiPickerExpanded: boolean) => void
}

export const UncontainedEmojiPicker: FunctionComponent<UncontainedEmojiPickerProps> = observer(({
    variant,
	editor,
	emojiPickerExpanded,
	setEmojiPickerExpanded
}) => {

	const handleEmojiSelect = (emoji: EmojiData): void => {
		if (editor) {
			editor.dispatchCommand(
				ADD_EMOJI,
				emoji
			);
		}
	};

	const handleStickerSelect = (): void => {
		if (setEmojiPickerExpanded && isDefined(emojiPickerExpanded)) {
			setEmojiPickerExpanded(false);
			window.history.go(-1);
		}
	};

	if (variant === "emoji-picker") {
		return <EmojiPicker onEmojiPicked={handleEmojiSelect}/>;
	} else {
		return (
			<EmojiAndStickerPicker onEmojiPicked={handleEmojiSelect}
								   onStickerPicked={handleStickerSelect}
			/>
		);
	}
});
