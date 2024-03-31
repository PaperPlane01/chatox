import React, {Fragment, FunctionComponent, ReactNode, useCallback, useState} from "react";
import {observer} from "mobx-react";
import {Hidden, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {LexicalComposer} from "@lexical/react/LexicalComposer";
import {RichTextPlugin} from "@lexical/react/LexicalRichTextPlugin";
import {ListPlugin} from "@lexical/react/LexicalListPlugin";
import {LinkPlugin} from "@lexical/react/LexicalLinkPlugin";
import {OnChangePlugin} from "@lexical/react/LexicalOnChangePlugin";
import {MarkdownShortcutPlugin} from "@lexical/react/LexicalMarkdownShortcutPlugin";
import {ClearEditorPlugin} from "@lexical/react/LexicalClearEditorPlugin";
import {CodeNode} from "@lexical/code";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {ListItemNode, ListNode} from "@lexical/list";
import {HeadingNode, QuoteNode} from "@lexical/rich-text";
import {HorizontalRuleNode} from "@lexical/react/LexicalHorizontalRuleNode";
import {ContentEditable} from "@lexical/react/LexicalContentEditable";
import {$convertFromMarkdownString, $convertToMarkdownString, TRANSFORMERS} from "@lexical/markdown";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import {EditorState, LexicalEditor} from "lexical";
import {BetterMentionsPlugin, createBetterMentionNode} from "lexical-better-mentions";
import {ContainedEmojiPicker} from "./ContainedEmojiPicker";
import {UncontainedEmojiPicker} from "./UncontainedEmojiPicker";
import {Mention} from "./Mention";
import {MentionMenu} from "./MentionMenu";
import {MentionsMenuItem} from "./MentionsMenuItem";
import {
	AutoLinkPlugin,
	EditorReadyListenerPlugin,
	EmojiPlugin,
	EnterActionsPlugin,
	FloatingToolbarPlugin
} from "../plugins";
import {EnterAction} from "../types";
import {adornmentStyle} from "../styles";
import {MENTION} from "../transformers";
import {EmojiPickerVariant} from "../../EmojiPicker";
import {useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
	editorWrapper: {
		display: "flex",
	},
	editorContainer: {
		position: "relative",
		flex: 1
	},
	editorInput: {
		maxHeight: 250,
		overflowY: "auto",
		outline: 0
	},
	ltr: {
		textAlign: "left"
	},
	rtr: {
		textAlign: "right"
	},
	placeholder: {
		...theme.typography.body1,
		paddingBottom: theme.spacing(1),
		marginBlockStart: 0,
		marginBlockEnd: 0,
		marginTop: theme.spacing(-1),
		color: theme.palette.text.secondary,
		userSelect: "none",
		pointerEvents: "none",
		overflow: "hidden",
		position: "absolute",
		top: 0,
		left: 5
	},
	paragraph: {
		...theme.typography.body1,
		marginBlockStart: 0,
		marginBlockEnd: 0,
		paddingBottom: theme.spacing(1)
	},
	heading1: theme.typography.h1,
	heading2: theme.typography.h2,
	heading3: theme.typography.h3,
	heading4: theme.typography.h4,
	heading5: theme.typography.h5,
	heading6: theme.typography.h6,
	bold: {
		fontWeight: theme.typography.fontWeightBold
	},
	italic: {
		fontStyle: "italic"
	},
	underline: {
		textDecoration: "underline"
	},
	strikethrough: {
		textDecoration: "line-through"
	},
	underlineStrikeThrough: {
		textDecoration: "underline line-through"
	},
	emojiPickerButton: adornmentStyle
}));

const EDITOR_NODES = [
	CodeNode,
	HeadingNode,
	AutoLinkNode,
	LinkNode,
	ListNode,
	ListItemNode,
	QuoteNode,
	HorizontalRuleNode,
	...createBetterMentionNode(Mention)
];

interface TextEditorProps {
	initialText: string,
	placeholder: string,
	onEnter: EnterAction,
	onCtrlEnter: EnterAction,
	startAdornment?: ReactNode,
	endAdornment?: ReactNode,
	emojiPickerVariant?: "none" | EmojiPickerVariant,
	useEmojiCodes?: boolean,
	emojiPickerExpanded?: boolean,
	setEmojiPickerExpanded?: (emojiPickerExpanded: boolean) => void,
	onUpdate: (text: string) => void,
	onEditorReady?: (editor: LexicalEditor) => void
}

const CUSTOM_TRANSFORMERS = [
	...TRANSFORMERS,
	MENTION
];

export const TextEditor: FunctionComponent<TextEditorProps> = observer(({
	initialText,
	placeholder,
	onEnter = "insertNewParagraph",
	onCtrlEnter = "insertNewParagraph",
	startAdornment,
	endAdornment,
	useEmojiCodes,
	emojiPickerExpanded,
	setEmojiPickerExpanded,
	emojiPickerVariant = "none",
	onUpdate,
	onEditorReady,
}) => {
	const {
		mentions: {
			searchMentions
		}
	} = useStore();

	const [editor, setEditor] = useState<LexicalEditor | undefined>(undefined);
	const classes = useStyles();

	const handleEditorReady = useCallback((editor: LexicalEditor) => {
		setEditor(editor);

		if (onEditorReady) {
			onEditorReady(editor);
		}
	}, [editor]);

	const handleChange = (state: EditorState): void => {
		state.read(() => {
			const markdown = $convertToMarkdownString(CUSTOM_TRANSFORMERS);
			onUpdate(markdown);
		});
	};

	return (
		<Fragment>
			<div className={classes.editorWrapper}>
				{startAdornment}
				<div className={classes.editorContainer}>
					<LexicalComposer initialConfig={{
						namespace: "chatox-editor",
						nodes: EDITOR_NODES,
						theme: {
							ltr: classes.ltr,
							rtl: classes.rtr,
							placeholder: classes.placeholder,
							paragraph: classes.paragraph,
							heading: {
								h1: classes.heading1,
								h2: classes.heading2,
								h3: classes.heading3,
								h4: classes.heading4,
								h5: classes.heading5
							},
							text: {
								bold: classes.bold,
								italic: classes.italic,
								underline: classes.underline,
								strikethrough: classes.strikethrough,
								underlineStrikethrough: classes.underlineStrikeThrough,
							}
						},
						editorState: () => $convertFromMarkdownString(initialText, CUSTOM_TRANSFORMERS),
						onError: error => console.error(error)
					}}>
						<RichTextPlugin contentEditable={<ContentEditable className={classes.editorInput}/>}
										placeholder={(
											<div className={classes.placeholder}>
												{placeholder}
											</div>
										)}
										ErrorBoundary={LexicalErrorBoundary}
						/>
						<EditorReadyListenerPlugin onEditorReady={handleEditorReady}/>
						<OnChangePlugin onChange={handleChange}/>
						<ListPlugin/>
						<LinkPlugin/>
						<MarkdownShortcutPlugin/>
						<FloatingToolbarPlugin/>
						<EnterActionsPlugin onEnter={onEnter} onCtrlEnter={onCtrlEnter}/>
						<ClearEditorPlugin/>
						{emojiPickerVariant !== "none" && <EmojiPlugin useEmojiCodes={useEmojiCodes}/>}
						<BetterMentionsPlugin triggers={["@"]}
											  onSearch={(_, query) => searchMentions(query ?? "")}
											  creatable={false}
											  menuItemComponent={MentionsMenuItem}
											  menuComponent={MentionMenu}
						/>
						<AutoLinkPlugin/>
					</LexicalComposer>
				</div>
				{emojiPickerVariant !== "none" && (
					<ContainedEmojiPicker variant={emojiPickerVariant}
										  editor={editor}
										  iconButtonClassName={classes.emojiPickerButton}
					/>
				)}
				{endAdornment}
			</div>
			{emojiPickerVariant !== "none" && emojiPickerExpanded && (
				<Hidden lgUp>
					<UncontainedEmojiPicker variant={emojiPickerVariant}
											emojiPickerExpanded={emojiPickerExpanded}
											setEmojiPickerExpanded={setEmojiPickerExpanded}
											editor={editor}
					/>
				</Hidden>
			)}
		</Fragment>
	);
});
