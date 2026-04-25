import {EditorState} from "lexical";

export type EnterAction = "insertNewParagraph" | ((editorState: EditorState) => void);
