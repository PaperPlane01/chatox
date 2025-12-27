import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TextField, Typography} from "@mui/material";
import {EditableStickersList} from "./EditableStickersList";
import {StickerPackFormContext} from "../types";
import {useStickerPackForm} from "../hooks";
import {useLocalization} from "../../store";
import {ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

interface StickerPackFormFieldsProps {
	context: StickerPackFormContext
	hideAddStickerButton?: boolean
	getErrorText: (error: ApiError, l: TranslationFunction) => string
}

export const StickerPackFormFields: FunctionComponent<StickerPackFormFieldsProps> = observer(({
	context,
	hideAddStickerButton = false,
	getErrorText
}) => {
	const {
		formValues,
		formErrors,
		stickerContainers,
		error,
		setFormValue
	} = useStickerPackForm(context);
	const {l} = useLocalization();

	return (
		<Fragment>
			<TextField label={l("sticker.pack.name")}
					   value={formValues.name}
					   onChange={event => setFormValue("name", event.target.value)}
					   fullWidth
					   margin="dense"
					   error={Boolean(formErrors.name)}
					   helperText={formErrors.name && l(formErrors.name)}
			/>
			<TextField label={l("sticker.pack.author")}
					   value={formValues.author}
					   onChange={event => setFormValue("author", event.target.value)}
					   fullWidth
					   margin="dense"
					   error={Boolean(formErrors.author)}
					   helperText={formErrors.author && l(formErrors.author)}
			/>
			<TextField label={l("sticker.pack.description")}
					   value={formValues.description}
					   onChange={event => setFormValue("description", event.target.value)}
					   fullWidth
					   margin="dense"
					   error={Boolean(formErrors.description)}
					   helperText={formErrors.description && l(formErrors.description)}
					   multiline
					   rows={4}
					   maxRows={Number.MAX_SAFE_INTEGER}
			/>
			<EditableStickersList stickerContainers={stickerContainers}
								  context={context}
								  hideAddStickerButton={hideAddStickerButton}
			/>
			{error && (
				<Typography style={{color: "red"}}>
					{getErrorText(error, l)}
				</Typography>
			)}
		</Fragment>
	);
});
