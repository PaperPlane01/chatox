import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {AvatarGroup} from "@mui/material";
import {MessageReactionUserAvatar} from "./MessageReactionUserAvatar";

interface MessageReactionUserAvatarsProps {
    userIds: string[]
}

export const MessageReactionUserAvatars: FunctionComponent<MessageReactionUserAvatarsProps> = observer(({
    userIds
}) => (
    <AvatarGroup spacing="small">
        {userIds.map(userId => (
            <MessageReactionUserAvatar
                userId={userId}
                key={userId}
            />
        ))}
    </AvatarGroup>
));
