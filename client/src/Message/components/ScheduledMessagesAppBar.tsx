import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {AppBar, IconButton, Toolbar, Typography} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {Link} from "mobx-router";
import {commonStyles} from "../../style";
import {useLocalization, useRouter, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {Routes} from "../../router";

const useStyles = makeStyles()(() => ({
    undecoratedLink: commonStyles.undecoratedLink
}));

export const ScheduledMessagesAppBar: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        }
    } = useStore();
    const router = useRouter();
    const {l} = useLocalization();
    const { classes } = useStyles();

    const chat = useEntityById("chats", selectedChatId);

    if (!chat) {
        return null;
    }

    return (
        <Fragment>
            <AppBar position="fixed">
                <Toolbar>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Link route={Routes.chatPage}
                              params={{slug: chat.slug}}
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
                            {l("message.delayed-message.list.with-chat-specified", {chatName: chat.name})}
                        </Typography>
                    </div>
                </Toolbar>
            </AppBar>
            <Toolbar/>
        </Fragment>
    );
});
