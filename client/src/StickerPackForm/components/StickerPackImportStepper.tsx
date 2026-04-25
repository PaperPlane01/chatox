import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Step, StepLabel, Stepper} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {StickerPackImportStage} from "../types";
import {Labels} from "../../localization";


export const StickerPackImportStepper: FunctionComponent = observer(() => {
	const {
		stickerPackImport: {
			currentStageNumber
		}
	} = useStore();
	const {l} = useLocalization();

	return (
		<Stepper activeStep={currentStageNumber}
				 alternativeLabel
		>
			{Object.keys(StickerPackImportStage).map(stage => (
				<Step key={stage}>
					<StepLabel>
						{l(`sticker.pack.import.stage.${stage}` as keyof Labels)}
					</StepLabel>
				</Step>
			))}
		</Stepper>
	);
});
