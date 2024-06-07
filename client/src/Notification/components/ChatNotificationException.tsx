import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {ChatType, NotificationLevel} from "../../api/types/response";
import {ChatAvatar} from "../../Chat";
import {getChatName} from "../../Chat/utils";
import {Labels} from "../../localization";

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
		}
	} = useStore();
	const {l} = useLocalization();
	const chat = useEntityById("chats", chatId);
	const chatUser = useEntityById("users", chat.userId)

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
		</ListItem>
	);
});
