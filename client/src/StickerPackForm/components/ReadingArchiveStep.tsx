import React, {ChangeEvent, CSSProperties, Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Typography} from "@mui/material";
import {FolderZip} from "@mui/icons-material";
import {LinearProgressWithLabel} from "../../LinearProgressWithLabel";
import {commonStyles} from "../../style";
import {useLocalization, useStore} from "../../store";
import {isDefined} from "../../utils/object-utils";

export const ReadingArchiveStep: FunctionComponent = observer(() => {
	const {
		stickerPackImport: {
			pending,
			currentFileName,
			length,
			currentStageProgress,
			currentStageProgressPercentage,
			importStickerPack
		}
	} = useStore();
	const {l} = useLocalization();

	const handleFileAttachment = (event: ChangeEvent<HTMLInputElement>): void => {
		if (event.target.files && event.target.files.length !== 0) {
			importStickerPack(event.target.files[0]);
		}
	};

	return (
		<div style={commonStyles.centered as unknown as CSSProperties}>
			{!pending && (
				<Button variant="outlined"
						color="primary"
						component="label"
						role={undefined}
						sx={{mt: 1}}
				>
					<FolderZip/>
					{l("sticker.pack.import.select-file")}
					<input style={{display: "none"}}
						   type="file"
						   accept="application/zip"
						   onChange={handleFileAttachment}
					/>
				</Button>
			)}
			{pending && (
				<Fragment>
					<LinearProgressWithLabel value={currentStageProgressPercentage}/>
					{isDefined(length) && (
						<Typography>
							{l("sticker.pack.import.stage.READING_ARCHIVE.progress", {
								progress: currentStageProgress,
								length
							})}
						</Typography>
					)}
					{isDefined(currentFileName) && (
						<Typography>
							{l("sticker.pack.import.stage.READING_ARCHIVE.current-file", {fileName: currentFileName})}
						</Typography>
					)}
				</Fragment>
			)}
		</div>
	);
});
