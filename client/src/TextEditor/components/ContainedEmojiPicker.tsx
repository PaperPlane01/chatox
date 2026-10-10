import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {EmojiData} from "emoji-mart";
import {LexicalEditor} from "lexical";
import {ADD_EMOJI} from "../commands";
import {EmojiPickerContainer} from "../../EmojiPicker/components";
import {EmojiPickerVariant} from "../../EmojiPicker/types";

interface ContainedEmojiPicker {
	variant: EmojiPickerVariant,
	editor?: LexicalEditor,
	iconButtonClassName?: string
}

export const ContainedEmojiPicker: FunctionComponent<ContainedEmojiPicker> = observer(({
	variant,
	editor,
	iconButtonClassName
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
							  iconButtonClassName={iconButtonClassName}
		/>
	);
});
