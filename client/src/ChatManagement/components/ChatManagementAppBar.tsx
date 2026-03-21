import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Link} from "mobx-router";
import {IconButton, AppBar, Typography, Toolbar} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {commonStyles} from "../../style";
import {useRouter, useStore, useLocalization} from "../../store";
import {Routes} from "../../router";

const useStyles = makeStyles()(() => ({
    undecoratedLink: commonStyles.undecoratedLink
}));

export const ChatManagementAppBar: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChat
        }
    } = useStore();
    const {l} = useLocalization();
    const router = useRouter();
    const {classes} = useStyles();

    if (!selectedChat) {
        return null;
    }

    return (
        <Fragment>
            <AppBar position="fixed">
                <Toolbar>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Link route={Routes.chatPage}
                              params={{slug: selectedChat.slug}}
                              router={router}
                              className={classes.undecoratedLink}
                        >
                            <IconButton color="inherit"
                                        size="medium"
                            >
                                <ArrowBack/>
                            </IconButton>
                        </Link>
                        <Typography variant="h6">
                            {l("chat.management.with-name", {chatName: selectedChat.name})}
                        </Typography>
                    </div>
                </Toolbar>
            </AppBar>
            <Toolbar/>
        </Fragment>
    );
});
