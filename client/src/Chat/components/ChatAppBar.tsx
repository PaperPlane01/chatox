import React, {Fragment, FunctionComponent, ReactElement} from "react";
import {observer} from "mobx-react";
import {AppBar, CardHeader, Hidden, IconButton, Toolbar, Typography} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import randomColor from "randomcolor";
import {ChatMenu} from "./ChatMenu";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {NavigationalDrawer, OpenDrawerButton} from "../../AppBar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {Labels} from "../../localization";
import {useLocalization, useRouter, useStore} from "../../store";
import {Routes} from "../../router";

const {Link} = require("mobx-router");

const getLabelFromError = (error: ApiError): keyof Labels => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return "server.unreachable";
    } else {
        return "error.unknown";
    }
};

export const ChatAppBar: FunctionComponent = observer(() => {
    const {
        chat: {
            pending,
            error,
            selectedChatId
        },
        onlineChatParticipants: {
            onlineParticipantsCount
        },
        entities: {
            chats: {
                findById: findChat
            }
        },
        chatInfoDialog: {
            setChatInfoDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();
    const routerStore = useRouter();

    let appBarContent: ReactElement;

    if (pending) {
        appBarContent = (
            <CardHeader title={<Skeleton width={90}/>}
                        subheader={<Skeleton width={60}/>}
                        avatar={<Skeleton variant="circle" width={40} height={40}/>}
            />
        )
    } else if (selectedChatId) {
        const chat = findChat(selectedChatId);
        appBarContent = (
            <CardHeader title={(
                <Typography variant="body1"
                            style={{cursor: "pointer"}}
                            onClick={() => setChatInfoDialogOpen(true)}
                >
                    {chat.name}
                </Typography>
            )}
                        subheader={(
                            <Typography variant="body2"
                                        style={{
                                            opacity: 0.5,
                                            cursor: "pointer"
                                        }}
                                        onClick={() => setChatInfoDialogOpen(true)}
                            >
                                {l(
                                    "chat.number-of-participants",
                                    {numberOfParticipants: chat.participantsCount, onlineParticipantsCount: `${onlineParticipantsCount}`}
                                )}
                            </Typography>
                        )}
                        avatar={(
                            <div style={{cursor: "pointer"}}
                                 onClick={() => setChatInfoDialogOpen(true)}
                            >
                                <Avatar avatarLetter={getAvatarLabel(chat.name)}
                                        avatarColor={randomColor({seed: chat.id})}
                                        avatarUri={chat.avatarUri}
                                        avatarId={chat.avatarId}
                                />
                            </div>
                        )}
                        action={
                            <ChatMenu/>
                        }
                        style={{
                            width: "100%"
                        }}
            />
        )
    } else if (error) {
        appBarContent = (
            <Typography>
                {l(getLabelFromError(error))}
            </Typography>
        )
    } else {
        appBarContent = <div/>
    }

    return (
        <Fragment>
            <AppBar position="sticky" style={{
                zIndex: 1300,
                maxHeight:64
            }}>
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
                                <ArrowBackIcon/>
                            </IconButton>
                        </Link>
                    </Hidden>
                    {appBarContent}
                </Toolbar>
            </AppBar>
            <NavigationalDrawer/>
        </Fragment>
    )
});
