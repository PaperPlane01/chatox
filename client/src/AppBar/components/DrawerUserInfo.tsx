import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import randomColor from "randomcolor";
import {Avatar} from "../../Avatar";
import {useAuthorization} from "../../store";

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

export const DrawerUserInfo: FunctionComponent = observer(() => {
    const classes = useStyles();
    const {currentUser} = useAuthorization();

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
});
