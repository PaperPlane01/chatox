import React, {FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {entries} from "mobx";
import {Dialog, DialogTitle, DialogContent, List, IconButton, Button} from "@mui/material";
import {Add, ArrowBack} from "@mui/icons-material";
import {UserNotificationException} from "./UserNotificationException";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {useEntityById} from "../../entities";
import {ChatParticipantsAutoComplete, ChatParticipationEntity} from "../../ChatParticipant";

export const UserNotificationExceptionsDialog: FunctionComponent = observer(() => {
	const [userSelectModeActive, setUserSelectModeActive] = useState(false);
	const {
		userNotificationExceptionsDialog: {
			dialogOpen,
			chatId,
			closeDialog: closeUserNotificationExceptionsDialog,
			onBackClick,
			closeDialogAndPreserveState,
			openDialogWithPreservedState
		},
		updateUserNotificationsSettingsInChatDialog: {
			openDialog: openUpdateUserNotificationSettingsDialog,
			closeDialog: closeUpdateUserNotificationSettingsDialog
		},
		updateChatNotificationsSettings: {
			initUserException
		},
		notificationsSettings: {
			getUserExceptionsForChat
		}
	} = useStore();
	const {l} = useLocalization();
	const {fullScreen} = useMobileDialog();

	const chat = useEntityById("chats", chatId);

	if (!chat) {
		return null;
	}

	const userExceptions = getUserExceptionsForChat(chat.id);

	const handleBackClick = (): void => {
		if (onBackClick) {
			onBackClick();
		} else {
			closeUserNotificationExceptionsDialog();
		}
	};

	const handleUserSelect = (chatParticipant: ChatParticipationEntity): void => {
		setUserSelectModeActive(false);
		initUserException(chatParticipant.userId);
		closeDialogAndPreserveState();
		openUpdateUserNotificationSettingsDialog({
			chatId: chat.id,
			userId: chatParticipant.userId,
			displayBackButton: true,
			onBackClick: () => {
				closeUpdateUserNotificationSettingsDialog();
				openDialogWithPreservedState();
			}
		});
	};

	return (
		<Dialog open={dialogOpen}
				fullScreen={fullScreen}
				fullWidth
				maxWidth="md"
				onClose={closeUserNotificationExceptionsDialog}
		>
			<DialogTitle>
				<IconButton onClick={handleBackClick}>
					<ArrowBack/>
				</IconButton>
				{l("notification.settings.for-chat.exceptions", {chatName: chat.name})}
			</DialogTitle>
			<DialogContent>
				<List>
					{entries(userExceptions).map(([userId, _]) => (
						<UserNotificationException chatId={chat.id}
												   userId={userId}
												   key={`${userId}_${chat.id}`}
						/>
					))}
				</List>
				{userSelectModeActive
					? (
						<ChatParticipantsAutoComplete chatId={chat.id}
													  onSelect={handleUserSelect}
						/>
					)
					: (
						<Button variant="text"
								color="primary"
								onClick={() => setUserSelectModeActive(true)}
						>
							<Add/>
							{l("notification.settings.add-user-exception")}
						</Button>
					)
				}
			</DialogContent>
		</Dialog>
	)
});
