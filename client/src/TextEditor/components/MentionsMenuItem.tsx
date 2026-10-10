import React, {forwardRef} from "react";
import {observer} from "mobx-react";
import {ListItemAvatar, ListItemText, MenuItem} from "@mui/material";
import {BeautifulMentionsMenuItemProps} from "lexical-beautiful-mentions";
import randomColor from "randomcolor";
import {MentionItem} from "../types";
import {useEntityById} from "../../entities";
import {getUserDisplayedName} from "../../User/utils/labels";
import {useLuminosity} from "../../utils/hooks";
import {UserAvatar} from "../../UserAvatar/components";

const _MentionsMenuItem = forwardRef<
	HTMLLIElement,
	BeautifulMentionsMenuItemProps
>(({item: {data}, ...props}, ref) => {
	const user = useEntityById("users", (data as MentionItem | undefined)?.id);
    const luminosity = useLuminosity();

	if (!user) {
		return null;
	}

	const avatarColor = randomColor({seed: user.id, luminosity});

	return (
		<MenuItem ref={ref}
				  {...props}
		>
			<ListItemAvatar>
                <UserAvatar user={user}/>
			</ListItemAvatar>
			<ListItemText>
				{getUserDisplayedName(user)}
			</ListItemText>
		</MenuItem>
	);
});

export const MentionsMenuItem = observer(_MentionsMenuItem);
