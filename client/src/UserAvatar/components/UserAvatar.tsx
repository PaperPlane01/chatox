import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Avatar, AvatarProps} from "../../Avatar";
import {useEntitySelector} from "../../entities";
import {useRandomColor} from "../../utils/hooks";
import {getUserAvatarLabel} from "../../User/utils/labels";
import {UserEntity} from "../../User";

type UserAvatarProps = Omit<AvatarProps, "avatarId" | "avatarLetter" | "avatarColor" | "avatarUri"> & {
    userId?: string,
    user?: UserEntity
}

export const UserAvatar: FunctionComponent<UserAvatarProps> = observer(({
    userId,
    user,
    ...rest
}) => {
    const selectedUser = useEntitySelector(
        "users",
            entities => {
            if (user) {
                return user;
            } else if (userId) {
                return entities.users.findById(userId);
            } else {
                return undefined;
            }
        }
    );

    const avatarColor = useRandomColor(selectedUser?.id);

    if (!selectedUser) {
        return null;
    }

    const avatarLetter = getUserAvatarLabel(selectedUser);

    return (
        <Avatar
            avatarLetter={avatarLetter}
            avatarColor={avatarColor}
            avatarId={selectedUser.avatarId}
            avatarUri={selectedUser.externalAvatarUri}
            {...rest}
        />
    );
});
