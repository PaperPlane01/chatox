import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Autocomplete, TextField} from "@mui/material";
import {ChatsOfCurrentUserListItemSimple} from "./ChatsOfCurrentUserListItemSimple";
import {useEntities, useStore} from "../../store";
import {ChatType} from "../../api/types/response";

interface ChatOfCurrentUserSelectProps {
	selectedChatId?: string,
	chatType?: ChatType,
	onChatSelect: (chatId?: string) => void,
	filter?: (chatId: string) => boolean
}

export const ChatOfCurrentUserSelect: FunctionComponent<ChatOfCurrentUserSelectProps> = observer(({
	selectedChatId,
	chatType,
	onChatSelect,
	filter
}) => {
	const {
		chatsOfCurrentUser: {
			getChatsInAlphabeticalOrder,
			getChatName
		}
	} = useStore();
	const {
		chats: {
			findById: findChat
		}
	} = useEntities();
	const chatsIds = getChatsInAlphabeticalOrder(chatType)
		.map(chat => chat.chatId)
		.filter(chatId => filter ? filter(chatId) : true);

	return (
		<Autocomplete renderInput={inputProps => (
			<TextField {...inputProps}
					   label="Select a chat"
                       slotProps={{
                           input: {
                               ...inputProps.InputProps,
                               autoComplete: "off"
                           }
                       }}
			/>
		)}
					  value={selectedChatId}
					  options={chatsIds}
					  getOptionLabel={chatId => {
						  const chat = findChat(chatId);
						  return getChatName(chat);
					  }}
					  renderOption={(_, chatId) => (
						  <ChatsOfCurrentUserListItemSimple chatId={chatId}
															onClick={() => onChatSelect(chatId)}
						  />
					  )}
		/>
	);
});
