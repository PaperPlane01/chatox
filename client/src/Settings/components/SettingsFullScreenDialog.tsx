import React, {FunctionComponent, ReactNode} from "react";
import {Dialog, DialogContent, DialogTitle, IconButton, createStyles, makeStyles} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";
import {Routes} from "../../router";
import {MapMobxToProps} from "../../store";
import {inject, observer} from "mobx-react";

const {Link} = require("mobx-router");

interface SettingsFullScreenDialogOwnProps {
    title: ReactNode,
    open: boolean
}

interface SettingsFullScreenDialogMobxProps {
    routerStore?: any
}

type SettingsFullScreenDialogProps = SettingsFullScreenDialogOwnProps & SettingsFullScreenDialogMobxProps;

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

const _SettingsFullScreenDialog: FunctionComponent<SettingsFullScreenDialogProps> = ({
    title,
    open,
    routerStore,
    children
}) => {
    const classes = useStyles();

    return (
        <Dialog open={open}
                fullScreen
        >
            <DialogTitle>
                <Link className={classes.undecoratedLink}
                      view={Routes.settingsPage}
                      store={routerStore}
                >
                    <IconButton>
                        <ArrowBack/>
                    </IconButton>
                </Link>
                {title}
            </DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
        </Dialog>
    )
};

const mapMobxToProps: MapMobxToProps<SettingsFullScreenDialogMobxProps> = ({store}) => ({
    routerStore: store
});

export const SettingsFullScreenDialog = inject(mapMobxToProps)(observer(_SettingsFullScreenDialog) as FunctionComponent<SettingsFullScreenDialogOwnProps>);
