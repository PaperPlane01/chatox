import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {AvatarGroup} from "@mui/material";
import {UserAvatar} from "../../UserAvatar/components";

interface MessageReactionUserAvatarsProps {
    userIds: string[]
}

export const MessageReactionUserAvatars: FunctionComponent<MessageReactionUserAvatarsProps> = observer(({
    userIds
}) => (
    <AvatarGroup spacing="small">
        {userIds.map(userId => (
            <UserAvatar
                key={userId}
                userId={userId}
                width={20}
                height={20}
            />
        ))}
    </AvatarGroup>
));
