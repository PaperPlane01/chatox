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
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useMobileDialog} from "../../utils/hooks";
import {getUserDisplayedName} from "../../User/utils/labels";

export const UpdateUserNotificationsSettingsInChatDialog: FunctionComponent = observer(() => {
	const {
		updateUserNotificationsSettingsInChatDialog: {
			dialogOpen,
			closeDialog,
			chatId,
			userId,
			displayBackButton,
			onBackClick,
			openDialogWithPreservedState,
			closeDialogAndPreserveState
		},
		updateChatNotificationsSettings: {
			request: {
				level,
				sound,
				userExceptions
			},
			setUserLevel,
			setUserSound,
			pending,
			updateChatNotificationsSettings
		},
		notificationSoundSelectDialog: {
			openDialog: openSoundDialog,
			closeDialog: closeSoundDialog
		}
	} = useStore();
	const chat = useEntityById("chats", chatId);
	const user = useEntityById("users", userId);
	const {l} = useLocalization();
	const {fullScreen} = useMobileDialog();
	const theme = useTheme();

	if (!chat || !user) {
		return null;
	}

	const handleBackClick = (): void => {
		if (onBackClick) {
			onBackClick();
		} else {
			closeDialog();
		}
	};

	const openSoundSelectDialog = (): void => {
		const title = l(
			"notification.sound.for-user-in-chat",
			{
				username: getUserDisplayedName(user),
				chatName: chat.name
			}
		);

		closeDialogAndPreserveState();
		openSoundDialog({
			title,
			selectedSound: userExceptions?.[user.id]?.sound ?? sound,
			onSoundSelect: sound => setUserSound(user.id, sound),
			onBackClick: () => {
				closeSoundDialog();
				openDialogWithPreservedState();
			},
			displayCloseButton: false
		});
	};

	return (
		<Dialog open={dialogOpen}
				onClose={closeDialog}
				fullScreen={fullScreen}
				fullWidth
				maxWidth="md"
		>
			<DialogTitle>
				{displayBackButton && (
					<IconButton onClick={handleBackClick}>
						<ArrowBack/>
					</IconButton>
				)}
				{l("notification.settings.for-user-in-chat", {
					username: getUserDisplayedName(user),
					chatName: chat.name
				})}
			</DialogTitle>
			<DialogContent>
				<NotificationLevelSelect value={userExceptions?.[user.id]?.level ?? level}
										 onChange={level => setUserLevel(user.id, level)}
										 style={{marginTop: theme.spacing(1)}}
				/>
				<div>
					{l("notification.sound")}: {sound}
					<Button onClick={openSoundSelectDialog}
							variant="text"
							color="primary"
					>
						{l("common.change")}
					</Button>
				</div>
			</DialogContent>
			<DialogActions>
				<Button variant="contained"
						color="primary"
						disabled={pending}
						onClick={updateChatNotificationsSettings}
				>
					{pending && <CircularProgress size={15} color="primary"/>}
					{l("save-changes")}
				</Button>
			</DialogActions>
		</Dialog>
	);
});
