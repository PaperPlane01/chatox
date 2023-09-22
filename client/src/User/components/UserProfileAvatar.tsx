import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import clsx from "clsx";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {useStore, useEntities} from "../../store";
import {isDefined} from "../../utils/object-utils";
import {getUserAvatarLabel} from "../utils/labels";

const useStyles = makeStyles(() => createStyles({
    clickable: {
        cursor: "pointer"
    }
}));

export const UserProfileAvatar: FunctionComponent = observer(() => {
    const {
        userProfile: {
            selectedUserId
        },
        userProfilePhotosGallery: {
            openLightboxToAvatar
        }
    } = useStore();
    const {
        users: {
            findById: findUser
        }
    } = useEntities()
    const classes = useStyles();

    if (!selectedUserId) {
        return null;
    }

    const user = findUser(selectedUserId);
    const avatarLetter = getUserAvatarLabel(user);
    const color = randomColor({seed: user.id});
    const clickable = isDefined(user.avatarId);

    const handleClick = (): void => {
        if (clickable) {
            openLightboxToAvatar();
        }
    };

    return (
        <Avatar avatarLetter={avatarLetter}
                avatarColor={color}
                avatarId={user.avatarId}
                width={64}
                height={64}
                avatarUri={user.externalAvatarUri}
                className={clsx({
                    [classes.clickable]: clickable
                })}
                onCLick={handleClick}
        />
    );
});
