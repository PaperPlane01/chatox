import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Box, Theme, Typography} from "@mui/material";
import {ChatBubble} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {Link} from "mobx-router";
import {HasAnyRole} from "../../Authorization";
import {Routes} from "../../router";
import {useLocalization, useRouter} from "../../store";

const useStyles = makeStyles()((theme: Theme) => ({
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
    const {classes}  = useStyles();
    const {l} = useLocalization();
    const routerStore = useRouter();

    return (
        <div className={classes.appBarLinks}>
            <Box sx={{
                display: {
                    xs: "none",
                    lg: "block",
                }
            }}>
                <HasAnyRole roles={["ROLE_USER", "ROLE_ANONYMOUS_USER"]}>
                    <Link route={Routes.myChats}
                          router={routerStore}
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
            </Box>
        </div>
    );
});
