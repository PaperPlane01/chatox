import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {AppBar, CardHeader, Hidden, IconButton, Toolbar, Typography} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import {ArrowBack} from "@material-ui/icons";
import {DialogChatAppBarContent} from "./DialogChatAppBarContent";
import {GroupChatAppBarContent} from "./GroupChatAppBarContent";
import {NavigationalDrawer, OpenDrawerButton} from "../../AppBar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {Labels} from "../../localization";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {ChatType} from "../../api/types/response";
import {NewPrivateChatAppBar} from "./NewPrivateChatAppBar";

const {Link} = require("mobx-router");

const getLabelFromError = (error: ApiError): keyof Labels => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return "server.unreachable";
    } else if (error.status === 404) {
        if (error.metadata && error.metadata.errorCode === "CHAT_DELETED") {
            return "chat.deleted"
        } else {
            return "chat.not-found";
        }
    } else {
        return "error.unknown";
    }
};

export const ChatAppBar: FunctionComponent = observer(() => {
    const {
        chat: {
            pending,
            errorsMap,
            selectedChatId,
            currentSlug
        },
        entities: {
            chats: {
                findById: findChat
            }
        },
        messageCreation: {
            userId
        }
    } = useStore();
    const {l} = useLocalization();
    const routerStore = useRouter();
    let appBarContent: ReactNode;

    if (pending) {
        appBarContent = (
            <CardHeader title={<Skeleton width={90}/>}
                        subheader={<Skeleton width={60}/>}
                        avatar={<Skeleton variant="circle" width={40} height={40}/>}
            />
        );
    } else if (selectedChatId) {
        const chat = findChat(selectedChatId);

        switch (chat.type) {
            case ChatType.DIALOG:
                appBarContent = <DialogChatAppBarContent chatId={selectedChatId}/>;
                break;
            case ChatType.GROUP:
                appBarContent = <GroupChatAppBarContent chatId={selectedChatId}/>
                break;
            default:
                appBarContent = <Typography>Unsupported chat type</Typography>;
        }
    } else  if (userId) {
        appBarContent = <NewPrivateChatAppBar/>;
    } else if (currentSlug && errorsMap[currentSlug]) {
        appBarContent = (
            <Typography>
                {l(getLabelFromError(errorsMap[currentSlug]))}
            </Typography>
        )
    } else {
        appBarContent = <div/>
    }

    return (
        <Fragment>
            <AppBar position="fixed">
                <Toolbar>
                    <Hidden mdDown>
                        <OpenDrawerButton/>
                    </Hidden>
                    <Hidden lgUp>
                        <Link view={Routes.myChats}
                              store={routerStore}
                              style={{
                                  textDecoration: "none",
                                  color: "inherit"
                              }}
                        >
                            <IconButton color="inherit"
                                        size="medium"
                            >
                                <ArrowBack/>
                            </IconButton>
                        </Link>
                    </Hidden>
                    {appBarContent}
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <NavigationalDrawer/>
        </Fragment>
    );
});
