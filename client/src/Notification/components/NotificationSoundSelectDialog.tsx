import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogActions,
	IconButton,
	Button,
	RadioGroup,
	FormControl,
	FormControlLabel,
	Radio,
	FormLabel
} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import {NOTIFICATION_SOUNDS, NotificationSound} from "../../api/types/response";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const NotificationSoundSelectDialog: FunctionComponent = observer(() => {
	const {
		notificationSoundSelectDialog: {
			open,
			title,
			selectedSound,
			displayCloseButton,
			selectSound,
			closeDialog,
			onBackClick,
		}
	} = useStore();
	const {l} = useLocalization();
	const {fullScreen} = useMobileDialog();

	return (
		<Dialog open={open}
				fullScreen={fullScreen}
				fullWidth
				maxWidth="md"
				onClose={closeDialog}
		>
			<DialogTitle>
				{onBackClick && (
					<IconButton onClick={onBackClick}>
						<ArrowBack/>
					</IconButton>
				)}
				{title}
			</DialogTitle>
			<DialogContent>
				<FormControl>
					<FormLabel id="notification-sound-radio-group-label">
						{l("notification.sound")}
					</FormLabel>
					<RadioGroup value={selectedSound}
								onChange={event => selectSound(event.target.value as any as NotificationSound)}
					>
						{NOTIFICATION_SOUNDS.map(sound => (
							<FormControlLabel control={<Radio/>}
											  label={sound}
											  key={sound}
											  value={sound}
							/>
						))}
					</RadioGroup>
				</FormControl>
			</DialogContent>
			{displayCloseButton && (
				<DialogActions>
					<Button onClick={closeDialog}>
						{l("close")}
					</Button>
				</DialogActions>
			)}
		</Dialog>
	);
});
