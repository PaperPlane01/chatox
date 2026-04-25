import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import randomColor from "randomcolor";
import {ChatOfCurrentUserEntity} from "../types";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User";
import {getUserAvatarLabel} from "../../User/utils/labels";
import {useLuminosity} from "../../utils/hooks";

interface ChatAvatarProps {
	chat: ChatOfCurrentUserEntity,
	chatUser?: UserEntity
}

export const ChatAvatar: FunctionComponent<ChatAvatarProps> = observer(({
	chat,
	chatUser
}) => {
	const luminosity = useLuminosity();
	const color = randomColor({
		seed: chatUser ? chatUser.id : chat.id,
		luminosity
	});

	return chatUser
		? (
			<Avatar avatarLetter={getUserAvatarLabel(chatUser)}
					avatarColor={color}
					avatarUri={chatUser.externalAvatarUri}
					avatarId={chatUser.avatarId}
			/>
		)
		: (
			<Avatar avatarLetter={getAvatarLabel(chat.name)}
					avatarColor={color}
					avatarUri={chat.avatarUri}
					avatarId={chat.avatarId}
			/>
		);
});
