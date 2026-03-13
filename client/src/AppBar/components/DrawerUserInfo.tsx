import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Theme, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {useAuthorization} from "../../store";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";

const useStyles = makeStyles()((theme: Theme) => ({
    userInfoContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column"
    },
    username: {
        marginTop: theme.spacing(1)
    }
}));

export const DrawerUserInfo: FunctionComponent = observer(() => {
    const {classes} = useStyles();
    const {currentUser} = useAuthorization();

    if (!currentUser) {
        return null;
    }

    const avatarLetter = getUserAvatarLabel(currentUser);
    const username = getUserDisplayedName(currentUser);

    return (
        <div className={classes.userInfoContainer}>
            <Avatar avatarLetter={avatarLetter}
                    avatarColor={randomColor({seed: currentUser.id})}
                    width={60}
                    height={60}
                    avatarId={currentUser.avatarId}
                    avatarUri={currentUser.externalAvatarUri}
            />
            <Typography className={classes.username}>
                {username}
            </Typography>
        </div>
    )
});
