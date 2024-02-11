import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Tooltip} from "@mui/material";
import {KeyboardVoice} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {useLocalization} from "../../store";
import {AttachAudioMenuItem} from "./AttachAudioMenuItem";
import {UploadType} from "../../api/types/response";
import {createAttachFileButtonStyles} from "../../style";

const useStyles = createAttachFileButtonStyles();

export const RecordVoiceMessageButton: FunctionComponent = observer(() => {
	const {l} = useLocalization();
	const popupState = usePopupState({
		popupId: "voiceMessageMenuPopup",
		variant: "popover"
	});
	const classes = useStyles();

	return (
		<Fragment>
			<IconButton size="large"
						color="primary"
						{...bindToggle(popupState)}
			>
				<KeyboardVoice/>
			</IconButton>
			<Menu {...bindMenu(popupState)}>
				<Tooltip title={l("feature.not-available")}>
					<div>
						<MenuItem disabled>
							<ListItemIcon>
								<KeyboardVoice/>
							</ListItemIcon>
							<ListItemText>
								{l("message.voice.record")}
							</ListItemText>
						</MenuItem>
					</div>
				</Tooltip>
				<AttachAudioMenuItem audioType={UploadType.VOICE_MESSAGE}
									 buttonClassName={classes.attachFileButton}
				/>
			</Menu>
		</Fragment>
	);
});
