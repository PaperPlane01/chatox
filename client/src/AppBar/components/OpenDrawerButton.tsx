import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {Menu} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {useStore} from "../../store";

const useStyles = makeStyles()(() => ({
    openDrawerButton: {
        marginLeft: -12,
        marginRight: 20,
        color: "inherit"
    }
}));

export const OpenDrawerButton: FunctionComponent = observer(() => {
    const { classes } = useStyles();
    const {appBar} = useStore();
    const {setDrawerExpanded} = appBar;

    return (
        <IconButton
            onClick={() => setDrawerExpanded(true)}
            className={classes.openDrawerButton}
            size="large">
            <Menu/>
        </IconButton>
    );
});
