import React, {ChangeEvent, FunctionComponent, ReactNode, useState} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Theme, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {StickerUploadProps} from "./StickerUploadProps";
import {UploadedFileContainer} from "../../utils/file-utils";
import {ApiError} from "../../api";
import {TranslationFunction} from "../../localization";
import {useLocalization} from "../../store";

interface AnimatedStickerUploadProps extends StickerUploadProps {
	icon: ReactNode,
	renderPreview: (uploadContainer: UploadedFileContainer) => ReactNode,
	renderErrorText: (error: ApiError, l: TranslationFunction) => ReactNode
}

const useStyles = makeStyles()((theme: Theme) => ({
    fileUploadButton: {
		marginTop: theme.spacing(1)
	},
    fileUploadContainer: {
		display: "flex",
		flexDirection: "column"
	}
}));

export const AnimatedStickerUpload: FunctionComponent<AnimatedStickerUploadProps> = observer(({
	icon,
	stickerContainer,
	renderPreview,
	renderErrorText
}) => {
	const [value, setValue] = useState("");
	const {classes} = useStyles();
	const {l} = useLocalization();

	const handleFileAttachment = (event: ChangeEvent<HTMLInputElement>): void => {
		if (event.target.files && event.target.files.length !== 0) {
			stickerContainer.uploadFile(event.target.files[0]);
		}
	};

	return (
		<div className={classes.fileUploadContainer}>
			{stickerContainer.uploadContainer && renderPreview(stickerContainer.uploadContainer)}
			<Button variant="outlined"
					color="primary"
					disabled={stickerContainer.pending}
					component="label"
					className={classes.fileUploadButton}
			>
				{stickerContainer.pending && <CircularProgress color="primary" size={25}/>}
				{!stickerContainer.pending && icon}
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
					{renderErrorText(stickerContainer.submissionError, l)}
				</Typography>
			)}
		</div>
	);
});
