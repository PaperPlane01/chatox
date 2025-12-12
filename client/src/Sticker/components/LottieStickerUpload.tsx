import React, {ChangeEvent, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Image} from "@mui/icons-material";
import {DotLottieWorkerReact} from "@lottiefiles/dotlottie-react";
import {HttpStatusCode} from "axios";
import {StickerUploadProps} from "./StickerUploadProps";
import {useLocalization} from "../../store";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const useStyles = makeStyles((theme: Theme) => createStyles({
	fileUploadButton: {
		marginTop: theme.spacing(1)
	},
	fileUploadContainer: {
		display: "flex",
		flexDirection: "column"
	},
	lottie: {
		width: 200,
		height: 200
	}
}));

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
	if (error.status === HttpStatusCode.BadRequest) {
		return l("sticker.lottie.error.invalid");
	} else if (error.status === API_UNREACHABLE_STATUS) {
		return l("common.error.server-unreachable");
	} else {
		return l("sticker.lottie.error.unknown");
	}
};

export const LottieStickerUpload: FunctionComponent<StickerUploadProps> = observer(({
	stickerContainer
}) => {
	const [value, setValue] = useState("");
	const {l} = useLocalization();
	const classes = useStyles();

	const handleFileAttachment = (event: ChangeEvent<HTMLInputElement>): void => {
		if (event.target.files && event.target.files.length !== 0) {
			stickerContainer.uploadFile(event.target.files[0]);
		}
	};

	return (
		<div className={classes.fileUploadContainer}>
			{stickerContainer.uploadContainer && (
				<DotLottieWorkerReact src={stickerContainer.uploadContainer?.uploadedFile?.uri ?? stickerContainer.uploadContainer.url}
									  autoplay
									  loop
									  className={classes.lottie}
									  useFrameInterpolation={false}
				/>
			)}
			<Button variant="outlined"
					color="primary"
					disabled={stickerContainer.pending}
					component="label"
					className={classes.fileUploadButton}
			>
				{stickerContainer.pending && <CircularProgress color="primary" size={25}/>}
				{!stickerContainer.pending && <Image/>}
				{l("file.upload")}
				<input type="file"
					   value={value}
					   style={{display: "none"}}
					   accept={stickerContainer.acceptedFiles}
					   onClick={() => setValue("")}
					   onChange={handleFileAttachment}
				/>
			</Button>
			{stickerContainer.fileValidationError && (
				<Typography variant="body1"
							style={{color: "red"}}
				>
					{stickerContainer.fileValidationError}
				</Typography>
			)}
			{stickerContainer.submissionError && (
				<Typography variant="body1"
							style={{color: "red"}}
				>
					{getErrorLabel(stickerContainer.submissionError, l)}
				</Typography>
			)}
		</div>
	);
});
