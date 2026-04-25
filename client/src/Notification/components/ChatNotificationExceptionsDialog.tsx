import React, {FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {Add, ArrowBack} from "@mui/icons-material";
import {ChatNotificationExceptionsList} from "./ChatNotificationExceptionsList";
import {ChatOfCurrentUserSelect} from "../../Chat";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {ChatType} from "../../api/types/response";

export const ChatNotificationExceptionsDialog: FunctionComponent = observer(() => {
	const [selectModeActive, setSelectModeActive] = useState(false);
	const {
		chatNotificationExceptionsDialog: {
			chatNotificationExceptionsDialogOpen,
			chatType,
			closeDialog: closeChatNotificationExceptionsDialog,
			openDialog: openChatNotificationExceptionsDialog
		},
		updateChatNotificationsSettings: {
			openDialog: openChatNotificationsSettingsDialog,
			closeDialog: closeChatNotificationsSettingsDialog
		},
		notificationsSettings: {
			groupChatsExceptions,
			dialogChatsExceptions
		}
	} = useStore();
	const {l} = useLocalization();
	const {fullScreen} = useMobileDialog();
	const dialogTitle = chatType === ChatType.DIALOG
		? l("notification.settings.exceptions.for-dialog-chats")
		: l("notification.settings.exceptions.for-group-chats");
	const filterMap = chatType === ChatType.DIALOG ? dialogChatsExceptions : groupChatsExceptions;

	const handleChatSelect = (chatId?: string): void => {
		if (!chatId) {
			return;
		}

		setSelectModeActive(false);
		closeChatNotificationExceptionsDialog();
		openChatNotificationsSettingsDialog({
			chatId,
			chatType,
			displayBackButton: true,
			onBackClick: () => {
				closeChatNotificationsSettingsDialog();
				openChatNotificationExceptionsDialog(chatType);
			}
		});
	};

	return (
		<Dialog open={chatNotificationExceptionsDialogOpen}
				onClose={closeChatNotificationExceptionsDialog}
				fullScreen={fullScreen}
				fullWidth
				maxWidth="md"
		>
			<DialogTitle>
				<IconButton onClick={closeChatNotificationExceptionsDialog}>
					<ArrowBack/>
				</IconButton>
				{dialogTitle}
			</DialogTitle>
			<DialogContent>
				<ChatNotificationExceptionsList chatType={chatType}/>
				{selectModeActive
					? (
						<ChatOfCurrentUserSelect onChatSelect={handleChatSelect}
												 chatType={chatType}
												 filter={chatId => !filterMap.has(chatId)}
						/>
					)
					: (
						<Button onClick={() => setSelectModeActive(true)}
								color="primary"
								variant="text"
						>
							<Add/>
							{l("notification.settings.add-exception")}
						</Button>
					)
				}
			</DialogContent>
			<DialogActions>
				<Button variant="outlined"
						color="secondary"
						onClick={closeChatNotificationExceptionsDialog}
				>
					{l("close")}
				</Button>
			</DialogActions>
		</Dialog>
	);
});
