import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	IconButton,
	useTheme
} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import {NotificationLevelSelect} from "./NotificationLevelSelect";
import {UserNotificationExceptionsButton} from "./UserNotificationExceptionsButton";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {useEntityById} from "../../entities";
import {getUserDisplayedName} from "../../User/utils/labels";
import {ChatType} from "../../api/types/response";

export const UpdateChatNotificationsSettingsDialog: FunctionComponent = observer(() => {
	const {
		updateChatNotificationsSettings: {
			updateChatNotificationsSettingsDialogOpen,
			chatId,
			request,
			displayBackButton,
			onBackClick,
			setLevel,
			setSound,
			closeDialogAndResetState,
			closeDialog,
			openDialogWithPreservedState,
			pending,
			updateChatNotificationsSettings
		},
		notificationSoundSelectDialog: {
			openDialog,
			closeDialog: closeSoundSelectDialog
		}
	} = useStore();
	const {l} = useLocalization();
	const {fullScreen} = useMobileDialog();
	const chat = useEntityById("chats", chatId);
	const chatUser = useEntityById("users", chat?.userId);
	const theme = useTheme();

	if (!chat) {
		return null;
	}

	const dialogTitle = chatUser
		? l("notification.settings.for-chat.with-user", {
			username: getUserDisplayedName(chatUser)
		})
		: l("notification.settings.for-chat", {
			chatName: chat.name
		});

	const openSoundSelectDialog = (): void => {
		const soundSelectDialogTitle = chatUser
			? l("notification.sound.for-chat.with-user", {
				username: getUserDisplayedName(chatUser)
			})
			: l("notification.sound.for-chat", {
				chatName: chat.name
			});

		closeDialog();

		openDialog({
			title: soundSelectDialogTitle,
			onBackClick: () => {
				closeSoundSelectDialog();
				openDialogWithPreservedState();
			},
			onSoundSelect: sound => setSound(sound),
			displayCloseButton: false,
			selectedSound: request.sound
		});
	};

	return (
		<Dialog open={updateChatNotificationsSettingsDialogOpen}
				fullScreen={fullScreen}
				fullWidth
				maxWidth="md"
				onClose={closeDialogAndResetState}
		>
			<DialogTitle>
				{displayBackButton && (
					<IconButton onClick={onBackClick}>
						<ArrowBack/>
					</IconButton>
				)}
				{dialogTitle}
			</DialogTitle>
			<DialogContent>
				<NotificationLevelSelect value={request.level}
										 onChange={level => setLevel(level)}
										 style={{marginTop: theme.spacing(1)}}
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
				{chat.type === ChatType.GROUP && (
					<UserNotificationExceptionsButton chatId={chat.id}/>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={updateChatNotificationsSettings}
						disabled={pending}
						color="primary"
						variant="contained"
				>
					{pending && <CircularProgress size={15} color="primary"/>}
					{l("save-changes")}
				</Button>
			</DialogActions>
		</Dialog>
	);
});
