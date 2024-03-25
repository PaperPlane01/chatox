import {FunctionComponent, useEffect} from "react";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {LexicalEditor} from "lexical";

interface EditorReadyListenerPluginProps {
	onEditorReady: (editor: LexicalEditor) => void
}

export const EditorReadyListenerPlugin: FunctionComponent<EditorReadyListenerPluginProps> = ({
	onEditorReady
}) => {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		return editor.registerUpdateListener(() => onEditorReady(editor));
	}, [editor]);

	return null;
};
