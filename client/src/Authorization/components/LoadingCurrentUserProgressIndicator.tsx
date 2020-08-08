import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {Backdrop, CircularProgress, createStyles, makeStyles, Theme} from "@material-ui/core";
import {MapMobxToProps} from "../../store";

interface LoadingCurrentUserProgressIndicatorMobxProps {
    fetchingCurrentUser: boolean
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    backdrop: {
        zIndex: theme.zIndex.drawer + 1,
        color: '#fff',
    }
}));

const _LoadingCurrentUserProgressIndicator: FunctionComponent<LoadingCurrentUserProgressIndicatorMobxProps> = ({
    fetchingCurrentUser
}) => {
    const classes = useStyles();

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
};

const mapMobxToProps: MapMobxToProps<LoadingCurrentUserProgressIndicatorMobxProps> = ({authorization}) => ({
    fetchingCurrentUser: authorization.fetchingCurrentUser
});

export const LoadingCurrentUserProgressIndicator = inject(mapMobxToProps)(observer(_LoadingCurrentUserProgressIndicator) as FunctionComponent);
