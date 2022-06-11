import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Menu} from "@mui/icons-material";
import {useStore} from "../../store";

const useStyles = makeStyles(() => createStyles({
    openDrawerButton: {
        marginLeft: -12,
        marginRight: 20,
        color: "inherit"
    }
}));

export const OpenDrawerButton: FunctionComponent = observer(() => {
    const classes = useStyles();
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
