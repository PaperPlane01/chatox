import React, {Fragment, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Button} from "@mui/material";
import {Add} from "@mui/icons-material";
import {ChatOfCurrentUserSelect} from "../../Chat";
import {useStore, useLocalization} from "../../store";
import {ChatType} from "../../api/types/response";

interface ChatNotificationExceptionsButtonProps {
	chatType: ChatType
}

export const ChatNotificationExceptionsButton: FunctionComponent<ChatNotificationExceptionsButtonProps> = observer(({
	chatType
}) => {
	const [chatSelectModeActive, setChatSelectModeActive] = useState(false);
	const {
		updateChatNotificationsSettings: {
			openDialog
		},
		notificationsSettings: {
			dialogChatsExceptions,
			groupChatsExceptions
		},
		chatNotificationExceptionsDialog: {
			openDialog: openChatNotificationExceptionsDialog
		}
	} = useStore();
	const {l} = useLocalization();

	const exceptionsCount = chatType === ChatType.DIALOG ? dialogChatsExceptions.size : groupChatsExceptions.size;

	const handleChatSelect = (chatId?: string): void => {
		setChatSelectModeActive(false);

		if (chatId) {
			openDialog({chatId, chatType});
		}
	};

	const handleExceptionButtonClick = (): void => {
		if (exceptionsCount === 0) {
			setChatSelectModeActive(true);
		} else {
			openChatNotificationExceptionsDialog(chatType);
		}
	};

	if (!chatSelectModeActive) {
		return (
			<Button variant="text"
					color="primary"
					onClick={handleExceptionButtonClick}
			>
				{exceptionsCount === 0 ? (
						<Fragment>
							<Add/>
							{l("notification.settings.add-exception")}
						</Fragment>
				) : (
					<Fragment>
						{l("notification.settings.exceptions", {exceptionsCount})}
					</Fragment>
				)}
			</Button>
		);
	} else {
		return (
			<div style={{width: "100%"}}>
				<ChatOfCurrentUserSelect onChatSelect={handleChatSelect}
										 chatType={chatType}
				/>
			</div>
		);
	}
});
