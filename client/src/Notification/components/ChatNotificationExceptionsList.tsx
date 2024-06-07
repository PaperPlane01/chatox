import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {entries} from "mobx";
import {List} from "@mui/material";
import {ChatNotificationException} from "./ChatNotificationException";
import {useStore} from "../../store";
import {ChatType} from "../../api/types/response";

interface ChatNotificationExceptionListProps {
	chatType: ChatType
}

export const ChatNotificationExceptionsList: FunctionComponent<ChatNotificationExceptionListProps> = observer(({
	chatType
}) => {
	const {
		updateChatNotificationsSettings: {
			openDialog: openChatNotificationsSettingsDialog,
			closeDialog: closeChatNotificationsSettingsDialog
		},
		chatNotificationExceptionsDialog: {
			openDialog: openChatNotificationExceptionsDialog,
			closeDialog: closeChatNotificationExceptionsDialog
		},
		notificationsSettings: {
			dialogChatsExceptions,
			groupChatsExceptions
		}
	} = useStore();

	const handleChatClick = (chatId: string) => {
		closeChatNotificationExceptionsDialog();
		openChatNotificationsSettingsDialog({
			chatType,
			chatId,
			displayBackButton: true,
			onBackClick: () => {
				closeChatNotificationsSettingsDialog();
				openChatNotificationExceptionsDialog(chatType);
			}
		});
	};

	const settingsMap = chatType === ChatType.DIALOG
		? dialogChatsExceptions
		: groupChatsExceptions;

	return (
		<List>
			{entries(settingsMap).map(([chatId, _]) => (
				<ChatNotificationException key={chatId}
										   chatId={chatId}
										   onClick={() => handleChatClick(chatId)}
				/>
			))}
		</List>
	);
});
