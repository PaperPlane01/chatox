import React, {Fragment, FunctionComponent, ReactElement} from "react";
import {observer} from "mobx-react";
import {
    AppBar,
    CardHeader,
    createStyles,
    Hidden,
    IconButton,
    makeStyles,
    Toolbar,
    Typography,
    useMediaQuery,
    useTheme
} from "@material-ui/core";
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
import {trimString} from "../../utils/string-utils";

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

const useStyles = makeStyles(() => createStyles({
    cardHeaderRoot: {
        padding: 0
    }
}));

export const ChatAppBar: FunctionComponent = observer(() => {
    const {
        chat: {
            pending,
            errorsMap,
            selectedChatId,
            currentSlug
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
    const classes = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

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
                <div style={{display: "flex"}}>
                    <Typography variant="body1"
                                style={{cursor: "pointer"}}
                                onClick={() => setChatInfoDialogOpen(true)}
                    >
                        {onSmallScreen ? trimString(chat.name, 25) : chat.name}
                    </Typography>
                </div>
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
                        classes={{
                            root: classes.cardHeaderRoot
                        }}
            />
        )
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
                                <ArrowBackIcon/>
                            </IconButton>
                        </Link>
                    </Hidden>
                    {appBarContent}
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <NavigationalDrawer/>
        </Fragment>
    )
});
