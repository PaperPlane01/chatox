import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, makeStyles, Typography, Theme} from "@material-ui/core";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {CurrentUser} from "../../api/types/response";
import {MapMobxToProps} from "../../store";

interface DrawerUserInfoMobxProps {
    currentUser?: CurrentUser
}

const useStyles = makeStyles((theme: Theme) => createStyles({
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

const _DrawerUserInfo: FunctionComponent<DrawerUserInfoMobxProps> = ({
    currentUser
}) => {
    const classes = useStyles();

    if (currentUser) {
        const avatarLetter = `${currentUser.firstName[0]} ${currentUser.lastName ? currentUser.lastName[0] : ""}`;

        return (
            <div className={classes.userInfoContainer}>
                <Avatar avatarLetter={avatarLetter}
                        avatarColor={randomColor({seed: currentUser.id})}
                        width={60}
                        height={60}
                        avatarId={currentUser.avatarId}
                />
                <Typography className={classes.username}>
                    {currentUser.firstName} {currentUser.lastName ? currentUser.lastName : ""}
                </Typography>
            </div>
        )
    } else {
        return null;
    }
};

const mapMobxToProps: MapMobxToProps<DrawerUserInfoMobxProps> = ({authorization}) => ({
    currentUser: authorization.currentUser
});

export const DrawerUserInfo = inject(mapMobxToProps)(observer(_DrawerUserInfo)) as FunctionComponent;
