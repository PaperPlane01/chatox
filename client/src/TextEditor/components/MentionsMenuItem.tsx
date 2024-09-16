import React, {forwardRef} from "react";
import {observer} from "mobx-react";
import {ListItemAvatar, ListItemText, MenuItem} from "@mui/material";
import {BetterMentionsMenuItemProps} from "lexical-better-mentions";
import randomColor from "randomcolor";
import {MentionItem} from "../types";
import {useEntityById} from "../../entities";
import {Avatar} from "../../Avatar";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";

const _MentionsMenuItem = forwardRef<
	HTMLLIElement,
	BetterMentionsMenuItemProps
>(({item: {data}, ...props}, ref) => {
	const user = useEntityById("users", (data as MentionItem | undefined)?.id);

	if (!user) {
		return null;
	}

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
