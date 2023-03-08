import React, {Fragment, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Hidden, Theme} from "@mui/material";
import {createStyles, makeStyles, useTheme} from "@mui/styles";
import clsx from "clsx";
import {ChatsOfCurrentUserList} from "./ChatsOfCurrentUserList";
import {CreateChatFloatingActionButton} from "./CreateChatFloatingActionButton";
import {CreateChatDialog} from "./CreateChatDialog";
import {ChatsOfCurrentUserListProps} from "../types";
import {ChatsAndMessagesSearchInput, ChatsAndMessagesSearchResult} from "../../ChatsAndMessagesSearch";
import {useAuthorization, usePermissions, useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    },
    chatListWrapper: {
        [theme.breakpoints.up("lg")]: {
            height: `calc(100vh - 64px)`,
            width: 480,
            overflow: "auto"
        },
        [theme.breakpoints.down("lg")]: {
            width: "100%"
        },
        position: "relative"
    },
    chatList: {
        width: "100%"
    },
    noTopBottomPadding: {
        paddingTop: 0,
        paddingBottom: 0
    },
    noLeftRightPadding: {
        paddingLeft: 0,
        paddingRight: 0
    }
}));

export const ChatsOfCurrentUserListWrapper: FunctionComponent = observer(() => {
    const {
        chatsAndMessagesSearchQuery: {
            searchModeActive
        },
    } = useStore();
    const {
        chats: {
            canCreateChat
        }
    } = usePermissions();
    const {
        currentUser
    } = useAuthorization();
    const classes = useStyles();
    const [hovered, setHovered] = useState(false);
    const theme = useTheme<Theme>();

    const listProps: ChatsOfCurrentUserListProps = {
        classes: {
            circularProgress: classes.centered,
            list: clsx({
                [classes.noTopBottomPadding]: true,
                [classes.chatList]: true
            }),
            accordion: classes.noLeftRightPadding,
            accordionDetails: classes.noLeftRightPadding
        }
    };

    return (
        <Fragment>
            <div className={classes.chatListWrapper}
                 onMouseEnter={() => setHovered(true)}
                 onMouseLeave={() => setHovered(false)}
            >
                <Hidden lgDown>
                    <div style={{
                        flex: 1,
                        position: "sticky",
                        backgroundColor: theme.palette.background.default,
                        zIndex: 100,
                        top: 0
                    }}>
                        <ChatsAndMessagesSearchInput style={{padding: "8px"}}/>
                    </div>
                </Hidden>
                {searchModeActive
                    ? <ChatsAndMessagesSearchResult {...listProps}/>
                    : <ChatsOfCurrentUserList {...listProps}/>
                }
                <Hidden lgUp>
                    {canCreateChat && <CreateChatFloatingActionButton/>}
                </Hidden>
                <Hidden lgDown>
                    {hovered && currentUser && <CreateChatFloatingActionButton/>}
                </Hidden>
            </div>
            <CreateChatDialog/>
        </Fragment>
    );
});
