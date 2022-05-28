import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {IconButton, AppBar, Typography, Toolbar} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import {useRouter, useStore, useLocalization} from "../../store";
import {Routes} from "../../router";

const {Link} = require("mobx-router");

export const ScheduledMessagesAppBar: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const router = useRouter();
    const {l} = useLocalization();

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    return (
        <Fragment>
            <AppBar position="fixed">
                <Toolbar>
                    <div style={{display: "flex", alignItems: "center"}}>
                        <Link view={Routes.chatPage}
                              params={{slug: chat.slug}}
                              store={router}
                              style={{
                                  textDecoration: "none",
                                  color: "inherit",
                              }}
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
