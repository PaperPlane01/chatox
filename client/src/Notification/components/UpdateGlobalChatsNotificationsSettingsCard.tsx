import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardContent, CardHeader, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {NotificationLevelSelect} from "./NotificationLevelSelect";
import {useLocalization, useStore} from "../../store";
import {ChatType} from "../../api/types/response";
import {Labels} from "../../localization";

interface UpdateGlobalChatsNotificationsSettingsCardProps {
	chatType: ChatType
}

const useStyles = makeStyles((theme: Theme) => createStyles({
	cardContent: {
		display: "flex",
		flexDirection: "column",
		gap: theme.spacing(1)
	}
}));

export const UpdateGlobalChatsNotificationsSettingsCard: FunctionComponent<UpdateGlobalChatsNotificationsSettingsCardProps> = observer(({
	chatType
}) => {
	const {
		updateGlobalNotificationsSettings: {
			notificationsSettingsRequests: {
				[chatType]: request
			},
			setSound,
			setLevel
		},
		notificationSoundSelectDialog: {
			openDialog,
			closeDialog
		}
	} = useStore();
	const {l} = useLocalization();
	const classes = useStyles();
	const label: keyof Labels = chatType === ChatType.DIALOG
		? "notification.settings.for-dialog-chats"
		: "notification.settings.for-group-chats";

	const openSoundSelectDialog = (): void => {
		const dialogTitle: keyof Labels = chatType === ChatType.DIALOG
			? "notification.sound.for-dialog-chats"
			: "notification.sound.for-group-chats";
		openDialog({
			title: l(dialogTitle),
			selectedSound: request.sound,
			displayCloseButton: true,
			onSoundSelect: sound => setSound(sound, chatType),
			onBackClick: () => closeDialog()
		});
	};

	return (
		<Card>
			<CardHeader title={l(label)}/>
			<CardContent className={classes.cardContent}>
				<NotificationLevelSelect value={request.level}
										 onChange={level => setLevel(level, chatType)}
				/>
				<div>
					{l("notification.sound")}: {request.sound}
					<Button onClick={openSoundSelectDialog}
							variant="text"
							color="primary"
					>
						Change
					</Button>
				</div>
			</CardContent>
		</Card>
	);
});
