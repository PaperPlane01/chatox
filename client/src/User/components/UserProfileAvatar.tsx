import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {makeStyles} from "tss-react/mui";
import {useStore} from "../../store/hooks";
import {useEntityById} from "../../entities";
import {isDefined} from "../../utils/object-utils";
import {UserAvatar} from "../../UserAvatar/components";

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

    if (!user) {
        return null;
    }

    const clickable = isDefined(user.avatarId);

    const handleClick = (): void => {
        if (clickable) {
            openLightboxToAvatar();
        }
    };

    return (
        <UserAvatar
            user={user}
            width={64}
            height={64}
            className={cx({
                [classes.clickable]: clickable
            })}
            onCLick={handleClick}
        />
    );
});
