import React, {FunctionComponent, PropsWithChildren, ReactNode} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {ArrowBack} from "@mui/icons-material";
import {Link} from "mobx-router";
import {commonStyles} from "../../style";
import {Routes} from "../../router";
import {useRouter} from "../../store";

interface SettingsFullScreenDialogProps {
    title: ReactNode,
    open: boolean
}

const useStyles = makeStyles()(() => ({
    undecoratedLink: commonStyles.undecoratedLink
}));

export const SettingsFullScreenDialog: FunctionComponent<PropsWithChildren<SettingsFullScreenDialogProps>> = observer(({
    title,
    open,
    children
}) => {
    const routerStore = useRouter();
    const {classes} = useStyles();

    return (
        <Dialog open={open}
                fullScreen
        >
            <DialogTitle>
                <Link className={classes.undecoratedLink}
                      route={Routes.settingsPage}
                      router={routerStore}
                >
                    <IconButton size="large">
                        <ArrowBack/>
                    </IconButton>
                </Link>
                {title}
            </DialogTitle>
            <DialogContent>
                {children}
            </DialogContent>
        </Dialog>
    );
});
