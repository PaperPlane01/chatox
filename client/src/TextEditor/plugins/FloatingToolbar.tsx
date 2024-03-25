import React, {forwardRef, useEffect, useState} from "react";
import {Theme, ToggleButton} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Code, FormatBold, FormatItalic, FormatStrikethrough} from "@mui/icons-material";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND} from "lexical";
import {FloatingToolbarCoordinates} from "../types";
import {isDefined} from "../../utils/object-utils";

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
	coordinates?: FloatingToolbarCoordinates
}

export const FloatingToolbar = forwardRef<HTMLDivElement, FloatingToolbarProps>(
	function FloatingToolbar({editor, coordinates}, ref) {
		const shouldShow = isDefined(coordinates);
		const classes = useStyles();

		const [state, setState] = useState<FloatingToolbarState>({
			isBold: false,
			isCode: false,
			isItalic: false,
			isStrikethrough: false
		});

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
			</div>
		);
	}
);
