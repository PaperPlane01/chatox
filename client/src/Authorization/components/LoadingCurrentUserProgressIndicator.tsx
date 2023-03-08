import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Backdrop, CircularProgress, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
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
    );
});
