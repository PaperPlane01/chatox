import React, {FunctionComponent, useCallback, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {useLexicalComposerContext} from "@lexical/react/LexicalComposerContext";
import {$createLinkNode, $isAutoLinkNode, TOGGLE_LINK_COMMAND} from "@lexical/link";
import {mergeRegister} from "@lexical/utils";
import {
	$getSelection,
	$isRangeSelection,
	COMMAND_PRIORITY_LOW,
	RangeSelection,
	SELECTION_CHANGE_COMMAND
} from "lexical";
import {getSelectedNode} from "../utils";
import {useLocalization, useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
	dialogContent: {
		paddingTop: theme.spacing(2)
	}
}));

export const CreateEditorLinkPlugin: FunctionComponent = observer(() => {
	const {
		editorLink: {
			formValues,
			formErrors,
			createLinkDialogOpen,
			setFormValue,
			submitForm,
			reset
		}
	} = useStore();
	const {l} = useLocalization();
	const [selection, setSelection] = useState<RangeSelection | null>(null);
	const [editor] = useLexicalComposerContext();
	const classes = useStyles();

	const updateLinkEditor = useCallback(() => {
		const selection = $getSelection();

		if (!$isRangeSelection(selection)) {
			setSelection(null);
			return;
		}

		if (!editor.isEditable()) {
			setSelection(null);
			return;
		}

		setSelection(selection);
	}, [createLinkDialogOpen, editor]);

	useEffect(() => {
		return mergeRegister(
			editor.registerUpdateListener(({editorState}) => {
				editorState.read(() => {
					updateLinkEditor();
				});
			}),

			editor.registerCommand(
				SELECTION_CHANGE_COMMAND,
				() => {
					updateLinkEditor();
					return true;
				},
				COMMAND_PRIORITY_LOW
			)
		)
	}, [editor, updateLinkEditor]);

	const insertLink = (): void => {
		submitForm();

		if (!selection) {
			return;
		}

		if (formErrors.url) {
			return;
		}

		editor.dispatchCommand(
			TOGGLE_LINK_COMMAND,
			formValues.url
		);

		editor.update(() => {
			const selection = $getSelection();

			if ($isRangeSelection(selection)) {
				const parent = getSelectedNode(selection);

				if ($isAutoLinkNode(parent)) {
					const linkNode = $createLinkNode(parent.getURL(), {
						rel: parent.__rel,
						target: parent.__target,
						title: parent.__title,
					});
					parent.replace(linkNode, true);
				}
			}

			reset();
		});
	};

	return (
		<Dialog open={createLinkDialogOpen}
				onClose={reset}
				fullWidth
				maxWidth="md"
		>
			<DialogTitle>
				{l("editor.create-link")}
			</DialogTitle>
			<DialogContent className={classes.dialogContent}>
				<TextField value={formValues.url}
						   onChange={event => setFormValue("url", event.target.value)}
						   label={l("editor.create-link.url")}
						   fullWidth
						   error={Boolean(formErrors.url)}
						   helperText={formErrors.url && l(formErrors.url)}
				/>
			</DialogContent>
			<DialogActions>
				<Button onClick={reset}>
					{l("cancel")}
				</Button>
				<Button onClick={insertLink}>
					{l("ok")}
				</Button>
			</DialogActions>
		</Dialog>
	);
});
