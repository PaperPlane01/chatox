import {FunctionComponent} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_CRITICAL,
	INSERT_LINE_BREAK_COMMAND,
	INSERT_PARAGRAPH_COMMAND,
	KEY_ENTER_COMMAND,
	LexicalEditor
} from "lexical";
import {EnterAction} from "../types";

interface EnterActionsPluginProps {
	onEnter: EnterAction,
	onCtrlEnter: EnterAction
}

const dispatchEnterAction = (action: EnterAction, editor: LexicalEditor): void => {
	if (action === "insertNewParagraph") {
		editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);
	} else {
		action(editor.getEditorState());
	}
};

export const EnterActionsPlugin: FunctionComponent<EnterActionsPluginProps> = ({
	onEnter,
	onCtrlEnter
}) => {
	const [editor] = useLexicalComposerContext();

	editor.registerCommand(
		KEY_ENTER_COMMAND,
		event => {
			const selection = $getSelection();

			if (!$isRangeSelection(selection)) {
				return false;
			}

			if (event === null) {
				return false;
			}

			event.preventDefault();

			if (event.ctrlKey) {
				dispatchEnterAction(onCtrlEnter, editor);
			} else {
				dispatchEnterAction(onEnter, editor);
			}

			return true;
		},
		COMMAND_PRIORITY_CRITICAL
	);

	editor.registerCommand(
		INSERT_LINE_BREAK_COMMAND,
		_ => {
			const selection = $getSelection();

			if ($isRangeSelection(selection)) {
				return false;
			}

			editor.dispatchCommand(INSERT_PARAGRAPH_COMMAND, undefined);

			return true;
		},
		COMMAND_PRIORITY_CRITICAL
	);

	return null;
};
