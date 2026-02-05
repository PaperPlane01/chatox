import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {Typography} from "@mui/material";
import {LinearProgressWithLabel} from "../../LinearProgressWithLabel";
import {useLocalization, useStore} from "../../store";
import {isDefined} from "../../utils/object-utils";

export const UploadingFilesStep: FunctionComponent = observer(() => {
	const {
		stickerPackImport: {
			currentStageProgress,
			currentStageProgressPercentage,
			length,
			currentFileName
		}
	} = useStore();
	const {l} = useLocalization();

	return (
		<Fragment>
			<LinearProgressWithLabel value={currentStageProgressPercentage}/>
			{isDefined(length) && (
				<Typography>
					{l("sticker.pack.import.stage.UPLOADING_FILES.progress", {
						progress: currentStageProgress,
						length
					})}
				</Typography>
			)}
			{isDefined(currentFileName) && (
				<Typography>
					{l("sticker.pack.import.stage.UPLOADING_FILES.current-file", {fileName: currentFileName})}
				</Typography>
			)}
		</Fragment>
	);
});
