import React, {Fragment, FunctionComponent, HTMLAttributes, ReactNode} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemAvatar, ListItemText, MenuItem} from "@mui/material";
import {ChatAvatar} from "./ChatAvatar";
import {getChatName} from "../utils";
import {useEntityById} from "../../entities";

type Variant = "listItem" | "menuItem";

interface WrapperProps extends HTMLAttributes<HTMLLIElement> {
	variant?: Variant,
	actionButton?: ReactNode
}

interface ChatsOfCurrentUserListItemSimpleProps extends WrapperProps{
	chatId: string
}

const wrap = (
	itemContent: ReactNode,
	{variant, onClick, actionButton}: WrapperProps
) => {
	const action = actionButton
		? (
			<span style={{float: "right"}}>
				{actionButton}
			</span>
		)
		: null;

	return variant === "listItem"
		? (
			<ListItem onClick={onClick}>
				{itemContent}
				{action}
			</ListItem>
		)
		: (
			<MenuItem onClick={onClick}>
				{itemContent}
				{action}
			</MenuItem>
		);
};

export const ChatsOfCurrentUserListItemSimple: FunctionComponent<ChatsOfCurrentUserListItemSimpleProps> = observer(({
	chatId,
	variant = "listItem",
	onClick,
	actionButton,
	...props
}) => {
	const chat = useEntityById("chats", chatId);
	const chatUser = useEntityById("users", chat.userId)
	const itemContent = (
		<Fragment>
			<ListItemAvatar>
				<ChatAvatar chat={chat} chatUser={chatUser}/>
			</ListItemAvatar>
			<ListItemText>
				{getChatName(chat, chatUser)}
			</ListItemText>
		</Fragment>
	);

	return wrap(
		itemContent,
		{
			variant,
			onClick,
			actionButton,
			...props
		}
	);
});
