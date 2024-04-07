import React, {forwardRef, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Theme, ToggleButton} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Code, FormatBold, FormatItalic, FormatStrikethrough, InsertLink} from "@mui/icons-material";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$isAutoLinkNode, $isLinkNode} from "@lexical/link";
import {$getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND} from "lexical";
import {FloatingElementCoordinates} from "../types";
import {getSelectedNode} from "../utils";
import {isDefined} from "../../utils/object-utils";
import {useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
	editorToolbarButton: {
		background: `${theme.palette.background.paper} !important`
	}
}));

interface FloatingToolbarState {
	isBold: boolean,
	isCode: boolean,
	isItalic: boolean,
	isStrikethrough: boolean
}

interface FloatingToolbarProps {
	editor: ReturnType<typeof useLexicalComposerContext>[0],
	coordinates?: FloatingElementCoordinates
}

const _FloatingToolbar = forwardRef<HTMLDivElement, FloatingToolbarProps>(
	function FloatingToolbar({editor, coordinates}, ref) {
		const shouldShow = isDefined(coordinates);
		const classes = useStyles();

		const [state, setState] = useState<FloatingToolbarState>({
			isBold: false,
			isCode: false,
			isItalic: false,
			isStrikethrough: false
		});

		const {
			editorLink: {
				openCreateLinkDialog,
				setFormValue
			}
		} = useStore();

		useEffect(() => {
				return editor.registerUpdateListener(
				({editorState}) => {
					editorState.read(() => {
						const selection = $getSelection();

						if (!$isRangeSelection(selection)) {
							return;
						}

						setState({
							isBold: selection.hasFormat("bold"),
							isCode: selection.hasFormat("code"),
							isItalic: selection.hasFormat("italic"),
							isStrikethrough: selection.hasFormat("strikethrough")
						});

						const node = getSelectedNode(selection);

						if ($isAutoLinkNode(node) || $isLinkNode(node)) {
							setFormValue("url", node.getURL())
						} else {
							setFormValue("url", "");
						}
					});
				}
			);
			},
			[editor]
		);

		return (
			<div ref={ref}
				 aria-hidden={!shouldShow}
				 style={{
					 position: "absolute",
					 top: coordinates?.y ?? 0,
					 left: coordinates?.x ?? 0,
					 visibility: shouldShow ? "visible" : "hidden",
					 opacity: shouldShow ? 1 : 0
				 }}
			>
				<ToggleButton selected={state.isBold}
							  value="bold"
							  className={classes.editorToolbarButton}
							  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold")}
				>
					<FormatBold/>
				</ToggleButton>
				<ToggleButton value="italic"
							  selected={state.isItalic}
							  className={classes.editorToolbarButton}
							  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic")}
				>
					<FormatItalic/>
				</ToggleButton>
				<ToggleButton value="strikethrough"
							  selected={state.isStrikethrough}
							  className={classes.editorToolbarButton}
							  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough")}
				>
					<FormatStrikethrough/>
				</ToggleButton>
				<ToggleButton value="code"
							  selected={state.isCode}
							  className={classes.editorToolbarButton}
							  onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code")}
				>
					<Code/>
				</ToggleButton>
				<ToggleButton value="link"
							  className={classes.editorToolbarButton}
							  onClick={openCreateLinkDialog}
				>
					<InsertLink/>
				</ToggleButton>
			</div>
		);
	}
);

export const FloatingToolbar = observer(_FloatingToolbar);
