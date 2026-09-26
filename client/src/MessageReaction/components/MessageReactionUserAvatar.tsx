import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Avatar} from "../../Avatar";
import {getUserAvatarLabel} from "../../User/utils/labels";
import {useRandomColor} from "../../utils/hooks";
import {useEntityById} from "../../entities";

interface MessageReactionUserAvatarProps {
    userId: string
}

export const MessageReactionUserAvatar: FunctionComponent<MessageReactionUserAvatarProps> = observer(({
    userId
}) => {
    const user = useEntityById("users", userId);
    const avatarLabel = getUserAvatarLabel(user);
    const avatarColor = useRandomColor(user.id);

    return (
        <Avatar
            avatarLetter={avatarLabel}
            avatarColor={avatarColor}
            avatarId={user.avatarId}
            width={20}
            height={20}
        />
    );
});
