import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {AppBar, CardHeader, Hidden, IconButton, Skeleton, Toolbar, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ArrowBack} from "@mui/icons-material";
import {Link} from "mobx-router";
import {DialogChatAppBarContent} from "./DialogChatAppBarContent";
import {GroupChatAppBarContent} from "./GroupChatAppBarContent";
import {NewPrivateChatAppBar} from "./NewPrivateChatAppBar";
import {NavigationalDrawer, OpenDrawerButton} from "../../AppBar";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {Labels} from "../../localization";
import {useLocalization, useRouter, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {Routes} from "../../router";
import {ChatType} from "../../api/types/response";
import {commonStyles} from "../../style";
import {ForwardMessagesAppBarContent} from "./ForwardMessagesAppBarContent";

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: commonStyles.undecoratedLink
}));

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
            currentSlug,
        },
        messageCreation: {
            userId
        },
        messagesForwarding: {
            forwardModeActive,
            forwardedFromChatId
        }
    } = useStore();
    const {l} = useLocalization();
    const routerStore = useRouter();
    const classes = useStyles();
    const chat = useEntityById("chats", selectedChatId);
    let appBarContent: ReactNode;

    if (pending) {
        appBarContent = (
            <CardHeader title={<Skeleton width={90}/>}
                        subheader={<Skeleton width={60}/>}
                        avatar={<Skeleton variant="circular" width={40} height={40}/>}
            />
        );
    } else if (selectedChatId && chat) {
        if (forwardModeActive && forwardedFromChatId === selectedChatId) {
            appBarContent = <ForwardMessagesAppBarContent/>
        } else {
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
        }
    } else if (userId) {
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
                    <Hidden lgDown>
                        <OpenDrawerButton/>
                    </Hidden>
                    <Hidden lgUp>
                        <Link route={Routes.myChats}
                              router={routerStore}
                              className={classes.undecoratedLink}
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
