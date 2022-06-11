import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Hidden, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ChatBubble} from "@mui/icons-material";
import {HasAnyRole} from "../../Authorization";
import {Routes} from "../../router";
import {useLocalization, useRouter} from "../../store";

const {Link} = require("mobx-router");

const useStyles = makeStyles((theme: Theme) => createStyles({
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

export const AppBarMenu: FunctionComponent = observer(() => {
    const classes = useStyles();
    const {l} = useLocalization();
    const routerStore = useRouter();

    return (
        <div className={classes.appBarLinks}>
            <Hidden mdDown>
                <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}>
                    <Link view={Routes.myChats}
                          store={routerStore}
                          className={classes.appBarLink}
                    >
                        <div className={classes.appBarLinkTextContainer}>
                            <div className={classes.appBarLinkIcon}>
                                <ChatBubble/>
                            </div>
                            <Typography variant="body1">
                                {l("chat.my-chats")}
                            </Typography>
                        </div>
                    </Link>
                </HasAnyRole>
            </Hidden>
        </div>
    );
});
