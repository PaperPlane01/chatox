import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, IconButton, makeStyles} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
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
        <IconButton onClick={() => setDrawerExpanded(true)}
                    className={classes.openDrawerButton}
        >
            <MenuIcon/>
        </IconButton>
    )
});
