import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {AddUserToBlacklistMenuItem} from "./AddUserToBlacklistMenuItem";
import {RemoveUserFromBlacklistMenuItem} from "./RemoveUserFromBlacklistMenuItem";
import {useStore} from "../../store";

interface BlacklistUserActionMenuItemWrapperProps {
    userId: string,
    onClick?: () => void
}

export const BlacklistUserActionMenuItemWrapper: FunctionComponent<BlacklistUserActionMenuItemWrapperProps> = observer(({
    userId,
    onClick
}) => {
    const {
        blacklistedUsers: {
            isUserBlacklisted
        }
    } = useStore();

    return isUserBlacklisted(userId)
        ? (
            <RemoveUserFromBlacklistMenuItem userId={userId}
                                             onClick={onClick}
            />
        )
        : (
            <AddUserToBlacklistMenuItem userId={userId}
                                        onClick={onClick}
            />
        );
});