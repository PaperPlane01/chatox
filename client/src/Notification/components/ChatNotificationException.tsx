import React, {FunctionComponent, MouseEvent, useCallback} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemAvatar, ListItemText, IconButton, Tooltip, useTheme} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {ChatType, NotificationLevel} from "../../api/types/response";
import {ChatAvatar} from "../../Chat";
import {getChatName} from "../../Chat/utils";
import {Labels} from "../../localization";
import {ensureEventWontPropagate} from "../../utils/event-utils";

interface ChatNotificationExceptionProps {
	chatId: string,
	onClick?: () => void
}

export const ChatNotificationException: FunctionComponent<ChatNotificationExceptionProps> = observer(({
	chatId,
	onClick
}) => {
	const {
		notificationsSettings: {
			groupChatsExceptions,
			dialogChatsExceptions
		},
		deleteChatNotificationsSettings: {
			deleteNotificationsSettingsForChat
		}
	} = useStore();
	const {l} = useLocalization();
	const theme = useTheme();
	const chat = useEntityById("chats", chatId);
	const chatUser = useEntityById("users", chat.userId)

	const handleDeleteClick = useCallback((event: MouseEvent) => {
		ensureEventWontPropagate(event);
		deleteNotificationsSettingsForChat(chat.id, chat.type);
	}, [chatId]);

	const settings = chat.type === ChatType.DIALOG
		? dialogChatsExceptions.get(chat.id)
		: groupChatsExceptions.get(chat.id);

	if (!settings) {
		return null;
	}

	const levelLabel = l(`notification.level.${settings.level}` as keyof Labels);
	const settingsLabel = settings.level === NotificationLevel.MUTED
		? levelLabel
		: `${levelLabel}; ${settings.sound}`;

	return (
		<ListItem onClick={onClick}
				  style={{cursor: "pointer"}}
		>
			<ListItemAvatar>
				<ChatAvatar chat={chat} chatUser={chatUser}/>
			</ListItemAvatar>
			<ListItemText primary={getChatName(chat, chatUser)}
						  secondary={settingsLabel}
			/>
			<Tooltip title={l("notification.settings.for-chat.delete")}>
				<IconButton onClick={handleDeleteClick}
							style={{color: theme.palette.error.dark}}
				>
					<Delete/>
				</IconButton>
			</Tooltip>
		</ListItem>
	);
});
