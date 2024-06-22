import React, {Fragment, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Button} from "@mui/material";
import {Add} from "@mui/icons-material";
import {ChatParticipantsAutoComplete, ChatParticipationEntity} from "../../ChatParticipant";
import {useLocalization, useStore} from "../../store";

interface UseNotificationExceptionsButtonProps {
	chatId: string
}

export const UserNotificationExceptionsButton: FunctionComponent<UseNotificationExceptionsButtonProps> = observer(({
	chatId
}) => {
	const [userSelectModeActive, setUserSelectModeActive] = useState(false);
	const {
		notificationsSettings: {
			getUserExceptionsForChat
		},
		userNotificationExceptionsDialog: {
			openDialog: openUserNotificationExceptionsDialog,
			closeDialog: closeUserNotificationExceptionsDialog
		},
		updateUserNotificationsSettingsInChatDialog: {
			openDialog: openUpdateUserNotificationsSettingsDialog,
			closeDialog: closeUserNotificationsSettingsDialog
		},
		updateChatNotificationsSettings: {
			openDialogWithPreservedState,
			closeDialog: closeUpdateChatNotificationsSettingsDialog
		}
	} = useStore();
	const {l} = useLocalization();

	const exceptionsCount = getUserExceptionsForChat(chatId).size;

	const handleExceptionButtonClick = (): void => {
		if (exceptionsCount === 0) {
			setUserSelectModeActive(true);
		} else {
			closeUpdateChatNotificationsSettingsDialog();
			openUserNotificationExceptionsDialog({
				chatId,
				onBackClick: () => {
					closeUserNotificationExceptionsDialog();
					openDialogWithPreservedState();
				}
			});
		}
	};

	const handleChatParticipantSelect = (chatParticipant: ChatParticipationEntity): void => {
		setUserSelectModeActive(false);
		closeUpdateChatNotificationsSettingsDialog();
		openUpdateUserNotificationsSettingsDialog({
			chatId,
			userId: chatParticipant.userId,
			displayBackButton: true,
			onBackClick: () => {
				closeUserNotificationsSettingsDialog();
				openDialogWithPreservedState();
			}
		});
	};

	if (userSelectModeActive) {
		return (
			<ChatParticipantsAutoComplete chatId={chatId} onSelect={handleChatParticipantSelect}/>
		);
	} else {
		return (
			<Button variant="text"
					color="primary"
					onClick={handleExceptionButtonClick}
			>
				{exceptionsCount === 0
					? (
						<Fragment>
							<Add/>
							{l("notification.settings.add-user-exception")}
						</Fragment>
					)
					: l("notification.settings.user-exceptions", {exceptionsCount})
				}
			</Button>
		);
	}
});
