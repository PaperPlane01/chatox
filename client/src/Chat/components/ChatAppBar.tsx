import React, {Fragment, FunctionComponent, ReactElement} from "react";
import {inject, observer} from "mobx-react";
import {AppBar, CardHeader, Toolbar, Typography, Hidden, IconButton} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import randomColor from "randomcolor";
import {ChatOfCurrentUserEntity} from "../types";
import {getAvatarLabel} from "../utils";
import {Avatar} from "../../Avatar";
import {OpenDrawerButton, NavigationalDrawer} from "../../AppBar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {Labels, localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";
import {Routes} from "../../router";

const {Link} = require("mobx-router");

interface ChatAppBarMobxProps {
    selectedChatId?: string,
    pending: boolean,
    error?: ApiError,
    routerStore?: any,
    findChat: (id: string) => ChatOfCurrentUserEntity
}

const getLabelFromError = (error: ApiError): keyof Labels => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return "server.unreachable";
    } else {
        return "error.unknown";
    }
};

const _ChatAppBar: FunctionComponent<ChatAppBarMobxProps & Localized> = ({
    selectedChatId,
    pending,
    error,
    routerStore,
    findChat,
    l
}) => {
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
                <Typography variant="body1">
                    {chat.name}
                </Typography>
            )}
                        subheader={(
                            <Typography variant="body2" style={{opacity: 0.5}}>
                                {l("chat.number-of-participants", {numberOfParticipants: chat.participantsCount})}
                            </Typography>
                        )}
                        avatar={(
                            <Avatar avatarLetter={getAvatarLabel(chat.name)}
                                    avatarColor={randomColor({seed: chat.id})}
                                    avatarUri={chat.avatarUri}
                            />
                        )}
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
                zIndex: 1300
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
                            <IconButton color="inherit" size="small">
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
};

const mapMobxToProps: MapMobxToProps<ChatAppBarMobxProps> = ({chat, entities, store}) => ({
    pending: chat.pending,
    error: chat.error,
    selectedChatId: chat.selectedChatId,
    routerStore: store,
    findChat: entities.chats.findById
});

export const ChatAppBar = localized(
    inject(mapMobxToProps)(observer(_ChatAppBar))
) as FunctionComponent;
