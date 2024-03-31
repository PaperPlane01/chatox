import React, {forwardRef} from "react";
import {observer} from "mobx-react";
import {ListItemAvatar, ListItemText, MenuItem} from "@mui/material";
import {BetterMentionsMenuItemProps} from "lexical-better-mentions";
import randomColor from "randomcolor";
import {MentionItem} from "../types";
import {useEntities} from "../../store";
import {Avatar} from "../../Avatar";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";

const _MentionsMenuItem = forwardRef<
	HTMLLIElement,
	BetterMentionsMenuItemProps
>(({item: {data}, ...props }, ref) => {
	const {
		users: {
			findById: findUser
		}
	} = useEntities();

	if (!data) {
		return null;
	}

	const {id} = (data as MentionItem);

	const user = findUser(id);
	const avatarColor = randomColor({seed: user.id});

	return (
		<MenuItem ref={ref}
				  {...props}
		>
			<ListItemAvatar>
				<Avatar avatarLetter={getUserAvatarLabel(user)}
						avatarColor={avatarColor}
						avatarId={user.avatarId}
				/>
			</ListItemAvatar>
			<ListItemText>
				{getUserDisplayedName(user)}
			</ListItemText>
		</MenuItem>
	);
});

export const MentionsMenuItem = observer(_MentionsMenuItem);
