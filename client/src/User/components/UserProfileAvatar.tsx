import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles} from "@mui/styles";
import clsx from "clsx";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {useStore} from "../../store";
import {useEntityById} from "../../entities";
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
    const classes = useStyles();
    const user = useEntityById("users", selectedUserId);

    if (!user) {
        return null;
    }

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
