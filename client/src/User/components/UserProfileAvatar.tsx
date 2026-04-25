import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {makeStyles} from "tss-react/mui";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {useStore} from "../../store";
import {useEntityById} from "../../entities";
import {isDefined} from "../../utils/object-utils";
import {getUserAvatarLabel} from "../utils/labels";
import {useLuminosity} from "../../utils/hooks";

const useStyles = makeStyles()(() => ({
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
    const {classes, cx} = useStyles();
    const user = useEntityById("users", selectedUserId);
    const luminosity = useLuminosity();

    if (!user) {
        return null;
    }

    const color = randomColor({seed: user.id, luminosity});
    const avatarLetter = getUserAvatarLabel(user);
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
                className={cx({
                    [classes.clickable]: clickable
                })}
                onCLick={handleClick}
        />
    );
});
