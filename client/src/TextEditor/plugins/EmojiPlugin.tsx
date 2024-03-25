import {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$createTextNode, $getSelection, $isRangeSelection, COMMAND_PRIORITY_HIGH} from "lexical";
import {ADD_EMOJI} from "../commands";

interface EmojiPluginProps {
	useEmojiCodes?: boolean
}

export const EmojiPlugin: FunctionComponent<EmojiPluginProps> = observer(({
	useEmojiCodes = false
}) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerCommand(
			ADD_EMOJI,
			emoji => {
				const selection = $getSelection();

				if (selection && $isRangeSelection(selection)) {
					const content = useEmojiCodes ? emoji.colons : emoji.native;
					selection.insertNodes([$createTextNode(content)])
				}

				return true;
			},
			COMMAND_PRIORITY_HIGH
		)
	}, [editor, useEmojiCodes]);

	return null;
});
