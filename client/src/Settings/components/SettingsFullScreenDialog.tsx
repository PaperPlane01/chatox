import React, {FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {createStyles, Dialog, DialogContent, DialogTitle, IconButton, makeStyles} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";
import {Routes} from "../../router";
import {useRouter} from "../../store";

const {Link} = require("mobx-router");

interface SettingsFullScreenDialogProps {
    title: ReactNode,
    open: boolean
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const SettingsFullScreenDialog: FunctionComponent<SettingsFullScreenDialogProps> = observer(({
    title,
    open,
    children
}) => {
    const routerStore = useRouter();
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
});
