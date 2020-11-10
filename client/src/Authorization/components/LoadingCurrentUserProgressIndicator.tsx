import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Backdrop, CircularProgress, createStyles, makeStyles, Theme} from "@material-ui/core";
import {useAuthorization} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    }
}));

export const LoadingCurrentUserProgressIndicator: FunctionComponent = observer(() => {
    const classes = useStyles();
    const {fetchingCurrentUser} = useAuthorization();

    if (!fetchingCurrentUser) {
        return null;
    }

    return (
        <Backdrop open={fetchingCurrentUser}
                  className={classes.backdrop}
        >
            <CircularProgress color="primary"/>
        </Backdrop>
    )
});
