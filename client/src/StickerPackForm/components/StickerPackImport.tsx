import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, CircularProgress} from "@mui/material";
import {CreateStickerPackStep} from "./CreateStickerPackStep";
import {StickerPackImportStepper} from "./StickerPackImportStepper";
import {ReadingArchiveStep} from "./ReadingArchiveStep";
import {UploadingFilesStep} from "./UploadingFilesStep";
import {StickersTypeSelect} from "./StickersTypeSelect";
import {StickerPackImportStage} from "../types";
import {useLocalization, useStore} from "../../store";

export const StickerPackImport: FunctionComponent = observer(() => {
	const {
		stickerPackImport: {
			currentStage,
			stickersType,
			pending,
			setStickersType,
			reset
		},
		stickerPackCreation: {
			pending: stickerPackCreationPending,
			submitForm
		}
	} = useStore();
	const {l} = useLocalization();

	return (
		<Card>
			<CardHeader title={l("sticker.pack.import")}/>
			<CardContent>
				{!stickersType && (
					<StickersTypeSelect onChange={setStickersType}/>
				)}
				{stickersType && (
					<Fragment>
						<StickerPackImportStepper/>
						{currentStage === StickerPackImportStage.READING_ARCHIVE && <ReadingArchiveStep/>}
						{currentStage === StickerPackImportStage.UPLOADING_FILES && <UploadingFilesStep/>}
						{currentStage === StickerPackImportStage.CREATING_STICKER_PACK && <CreateStickerPackStep/>}
					</Fragment>
				)}
			</CardContent>
			<CardActions>
				<Button onClick={reset}
						color="secondary"
						variant="outlined"
						disabled={pending}
				>
					{l("cancel")}
				</Button>
				{currentStage === StickerPackImportStage.CREATING_STICKER_PACK && (
					<Button onClick={submitForm}
							variant="contained"
							color="primary"
							disabled={stickerPackCreationPending}
					>
						{pending && <CircularProgress size={15} color="primary"/>}
						{l("sticker.pack.create")}
					</Button>
				)}
			</CardActions>
		</Card>
	);
});
