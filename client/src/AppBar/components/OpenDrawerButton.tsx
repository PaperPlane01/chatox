import React, {FunctionComponent} from "react";
import {inject} from "mobx-react";
import {IconButton, createStyles, makeStyles} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import {MapMobxToProps} from "../../store";

interface OpenDrawerButtonMobxProps {
    setDrawerOpen: (drawerOpen: boolean) => void
}

const useStyles = makeStyles(() => createStyles({
    openDrawerButton: {
        marginLeft: -12,
        marginRight: 20,
        color: "inherit"
    }
}));

const _OpenDrawerButton: FunctionComponent<OpenDrawerButtonMobxProps> = ({setDrawerOpen}) => {
    const classes = useStyles();

    return (
        <IconButton onClick={() => setDrawerOpen(true)}
                    className={classes.openDrawerButton}
        >
            <MenuIcon/>
        </IconButton>
    )
};

const mapMobxToProps: MapMobxToProps<OpenDrawerButtonMobxProps> = ({appBar}) => ({
    setDrawerOpen: appBar.setDrawerExpanded
});

export const OpenDrawerButton = inject(mapMobxToProps)(_OpenDrawerButton as FunctionComponent);
