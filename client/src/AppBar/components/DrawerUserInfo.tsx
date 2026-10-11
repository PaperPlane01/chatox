import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Theme, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {useAuthorization} from "../../store/hooks";
import {getUserDisplayedName} from "../../User/utils/labels";
import {UserAvatar} from "../../UserAvatar/components";
import {useEntityById} from "../../entities";

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
    const currentUserEntity = useEntityById("users", currentUser?.id);

    if (!currentUserEntity) {
        return null;
    }

    return (
        <div className={classes.userInfoContainer}>
            <UserAvatar
                user={currentUserEntity}
                width={60}
                height={60}
            />
            <Typography className={classes.username}>
                {getUserDisplayedName(currentUserEntity)}
            </Typography>
        </div>
    )
});
