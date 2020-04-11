import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, Hidden, makeStyles, Typography} from "@material-ui/core";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble"
import {HasRole} from "../../Authorization";
import {localized, Localized} from "../../localization";
import {Routes} from "../../router";
import {MapMobxToProps} from "../../store";

const {Link} = require("mobx-router");

interface AppBarMenuMobxProps {
    routerStore?: any
}

const useStyles = makeStyles(theme => createStyles({
    appBarLinks: {
        marginLeft: theme.spacing(6),
        display: "flex"
    },
    appBarLinkIcon: {
        marginRight: theme.spacing(2)
    },
    appBarLink: {
        color: "inherit",
        textDecoration: "none",
        display: "flex"
    },
    appBarLinkTextContainer: {
        display: "flex",
        alignItems: "center"
    }
}));

const _AppBarMenu: FunctionComponent<AppBarMenuMobxProps & Localized> = ({
    routerStore,
    l
}) => {
    const classes = useStyles();

    return (
        <div className={classes.appBarLinks}>
            <Hidden xsDown>
                <HasRole role="ROLE_ACCESS_TOKEN_PRESENT">
                    <Link view={Routes.myChats}
                          store={routerStore}
                          className={classes.appBarLink}
                    >
                        <div className={classes.appBarLinkTextContainer}>
                            <div className={classes.appBarLinkIcon}>
                                <ChatBubbleIcon/>
                            </div>
                            <Typography variant="body1">
                                {l("chat.my-chats")}
                            </Typography>
                        </div>
                    </Link>
                </HasRole>
            </Hidden>
        </div>
    )
};

const mapMobxToProps: MapMobxToProps<AppBarMenuMobxProps> = ({store}) => ({
    routerStore: store
});

export const AppBarMenu = localized(
    inject(mapMobxToProps)(observer(_AppBarMenu))
) as FunctionComponent;
