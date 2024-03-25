import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {EmojiData} from "emoji-mart";
import {LexicalEditor} from "lexical";
import {ADD_EMOJI} from "../commands";
import {EmojiPickerContainer, EmojiPickerVariant} from "../../EmojiPicker";

interface ContainedEmojiPicker {
	variant: EmojiPickerVariant,
	editor?: LexicalEditor
}

export const ContainedEmojiPicker: FunctionComponent<ContainedEmojiPicker> = observer(({
	variant,
	editor
}) => {

	const handleEmojiSelect = (emoji: EmojiData): void => {
		if (editor) {
			editor.dispatchCommand(
				ADD_EMOJI,
				emoji
			);
		}
	};

	return (
		<EmojiPickerContainer onEmojiSelected={handleEmojiSelect}
							  variant={variant}
		/>
	);
});
