import React, {FunctionComponent, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {Autocomplete, TextField} from "@mui/material";
import {ChatParticipantsListItem} from "./ChatParticipantsListItem";
import {ChatParticipationEntity} from "../types";
import {useEntities, useStore} from "../../store";
import {useEntitiesByIds} from "../../entities";
import {getUserDisplayedName} from "../../User/utils/labels";

interface ChatParticipantsAutoCompleteProps {
	chatId: string,
	onSelect: (chatParticipant: ChatParticipationEntity) => void
}

export const ChatParticipantsAutoComplete: FunctionComponent<ChatParticipantsAutoCompleteProps> = observer(({
	chatId,
	onSelect
}) => {
	const [open, setOpen] = useState(false);
	const {
		chatParticipantsAutoComplete: {
			fetchChatParticipants,
			getLoadedChatParticipants,
			pending
		}
	} = useStore();
	const {
		users: {
			findById: findUser
		}
	} = useEntities();
	const loadedChatParticipants = getLoadedChatParticipants(chatId);
	const chatParticipants = useEntitiesByIds("chatParticipations", loadedChatParticipants);

	useEffect(
		() => {
			if (open) {
				fetchChatParticipants(chatId, "");
			}
		},
		[open]
	);

	return (
		<Autocomplete renderInput={props =>
			<TextField {...props}
					   label="Select chat participant"
					   inputProps={{
						   ...props.inputProps,
						   autoComplete: "off"
					   }}
			/>
		}
					  options={chatParticipants}
					  open={open}
					  onOpen={() => setOpen(true)}
					  onClose={() => setOpen(false)}
					  loading={pending}
					  getOptionLabel={chatParticipant => {
						  const user = findUser(chatParticipant.userId);
						  return getUserDisplayedName(user);
					  }}
					  onInputChange={(_, query) => fetchChatParticipants(chatId, query)}
					  renderOption={(_, chatParticipant) => (
						  <ChatParticipantsListItem participantId={chatParticipant.id}
													hideMenu
													onClick={() => onSelect(chatParticipant)}
													key={chatParticipant.id}
						  />
					  )}
		/>
	);
});
