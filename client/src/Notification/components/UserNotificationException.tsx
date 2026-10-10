import React, {FunctionComponent, MouseEvent, useCallback} from "react";
import {observer} from "mobx-react";
import {IconButton, ListItem, ListItemAvatar, ListItemText, Tooltip, useTheme} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store/hooks";
import {useEntityById} from "../../entities";
import {getUserDisplayedName} from "../../User/utils/labels";
import {ensureEventWontPropagate} from "../../utils/event-utils";
import {Labels} from "../../localization";
import {NotificationLevel} from "../../api/types/response";
import {UserAvatar} from "../../UserAvatar/components";

interface UserNotificationExceptionProps {
	chatId: string,
	userId: string
}

export const UserNotificationException: FunctionComponent<UserNotificationExceptionProps> = observer(({
	chatId,
	userId,
}) => {
	const {
		notificationsSettings: {
			getNotificationsSettingsForUserInChat
		},
		userNotificationExceptionsDialog: {
			openDialogWithPreservedState,
			closeDialogAndPreserveState
		},
		updateChatNotificationsSettings: {
			deleteUserException,
			updateChatNotificationsSettings,
			pending
		},
		updateUserNotificationsSettingsInChatDialog: {
			openDialog: openUserSettingsDialog,
			closeDialog: closeUserSettingsDialog
		}
	} = useStore();
	const {l} = useLocalization();
	const user = useEntityById("users", userId);
	const theme = useTheme();
	const settings = getNotificationsSettingsForUserInChat(chatId, userId);

	const handleDeleteClick = useCallback(
		(event: MouseEvent) => {
			ensureEventWontPropagate(event);
			deleteUserException(userId);
			updateChatNotificationsSettings();
		},
		[chatId, userId]
	);
	const handleClick = useCallback(() => {
		closeDialogAndPreserveState();
		openUserSettingsDialog({
			chatId,
			userId,
			displayBackButton: true,
			onBackClick: () => {
				closeUserSettingsDialog()
				openDialogWithPreservedState();
			}
		});
	}, [userId, chatId])

	if (!settings) {
		return null;
	}

	const levelLabel = l(`notification.level.${settings.level}` as keyof Labels);
	const settingsLabel = settings.level === NotificationLevel.MUTED
		? levelLabel
		: `${levelLabel}; ${settings.sound}`;

	return (
		<ListItem onClick={handleClick}
				  style={{cursor: "pointer"}}
		>
			<ListItemAvatar>
                <UserAvatar user={user}/>
			</ListItemAvatar>
			<ListItemText primary={getUserDisplayedName(user)}
						  secondary={settingsLabel}
			/>
			<Tooltip title={l("notification.settings.for-user-in-chat.delete")}>
				<IconButton onClick={handleDeleteClick}
							disabled={pending}
							style={{color: theme.palette.error.dark}}
				>
					<Delete/>
				</IconButton>
			</Tooltip>
		</ListItem>
	);
});
