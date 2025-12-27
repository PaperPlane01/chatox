import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Divider, Typography} from "@mui/material";
import {HttpStatusCode} from "axios";
import {EditableStickersList} from "./EditableStickersList";
import {CreateStickerDialog} from "./CreateStickerDialog";
import {EditStickerDialog} from "./EditStickerDialog";
import {StickerPackFormFields} from "./StickerPackFormFields";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
	let errorText = l("sticker.pack.update.error.unknown");

	if (error.status === API_UNREACHABLE_STATUS) {
		errorText = l("sticker.pack.update.error.server-unreachable");
	} else if (error.status === HttpStatusCode.NotFound) {
		if (error.metadata?.errorCode === "STICKERS_NOT_FOUND") {
			errorText = l("sticker.pack.update.error.stickers-not-found");
		}
	}

	return errorText;
};

export const UpdateStickerPackForm: FunctionComponent = observer(() => {
	const {
		stickerPackUpdate: {
			stickerPackId,
			stickerUnderCreation,
			editedSticker,
			addedStickersContainers,
			pending,
			saveAddedStickersPending,
			submitForm,
			reset
		}
	} = useStore();
	const {l} = useLocalization();
	const stickerPack = useEntityById("stickerPacks", stickerPackId);

	if (!stickerPack) {
		return null;
	}

	return (
		<Fragment>
			<Card>
				<CardHeader title={l("sticker.pack.update", {stickerPackName: stickerPack.name})}/>
				<CardContent>
					<StickerPackFormFields context="stickerPackUpdate"
										   getErrorText={getErrorText}
										   hideAddStickerButton
					/>
					<Divider/>
					<Typography variant="h6">
						{l("sticker.add.new")}
					</Typography>
					<EditableStickersList stickerContainers={addedStickersContainers} context="stickerPackUpdate"/>
				</CardContent>
			</Card>
			<CardActions>
				<Button onClick={reset}
						color="secondary"
						variant="outlined"
				>
					{l("cancel")}
				</Button>
				<Button onClick={submitForm}
						variant="contained"
						color="primary"
						disabled={pending || saveAddedStickersPending}
				>
					{(pending || saveAddedStickersPending) && <CircularProgress size={15} color="primary"/>}
					{l("save-changes")}
				</Button>
			</CardActions>
			{stickerUnderCreation && (
				<CreateStickerDialog stickerContainer={stickerUnderCreation} context="stickerPackUpdate"/>
			)}
			{editedSticker && (
				<EditStickerDialog stickerContainer={editedSticker} context="stickerPackUpdate" hideUploadInput/>
			)}
		</Fragment>
	);
});
