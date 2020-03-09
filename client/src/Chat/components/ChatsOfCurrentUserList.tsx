import React, {FunctionComponent, Fragment} from "react";
import {inject, observer} from "mobx-react";
import {CircularProgress, createStyles, List, makeStyles, Hidden, Divider, Drawer, Toolbar} from "@material-ui/core";
import {ChatsOfCurrentUserListItem} from "./ChatsOfCurrentUserListItem";
import {MapMobxToProps} from "../../store";

interface ChatsOfCurrentUserListMobxProps {
    chatIds: string[],
    pending: boolean
}

const useStyles = makeStyles(theme => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%"
    },
    chatListDrawer: {
        flexShrink: 0,
        width: 260,
    },
    chatListDrawerPaper: {
        width: 260,
    }
}));

const _ChatsOfCurrentUserList: FunctionComponent<ChatsOfCurrentUserListMobxProps> = ({
    chatIds,
    pending
}) => {
    const classes = useStyles();

    const handleChatSelect = (chatId: string): void => {

    };

    if (pending) {
        return (
            <div className={classes.centered}>
                <CircularProgress size={40} color="primary"/>
            </div>
        )
    }

    const chatList = (
        <List>
            {chatIds.map(chatId => (
                <Fragment>
                    <ChatsOfCurrentUserListItem chatId={chatId}
                                                onChatSelected={handleChatSelect}
                                                key={chatId}
                    />
                    <Divider variant="inset"/>
                </Fragment>
            ))}
        </List>
    );

    return (
        <Fragment>
            <Hidden mdDown>
                <Drawer variant="permanent"
                        open
                        className={classes.chatListDrawer}
                        classes={{
                            paper: classes.chatListDrawerPaper
                        }}
                >
                    <Toolbar/>
                    {chatList}
                </Drawer>
            </Hidden>
            <Hidden lgUp>
                {chatList}
            </Hidden>
        </Fragment>
    );
};

const mapMobxToProps: MapMobxToProps<ChatsOfCurrentUserListMobxProps> = ({chatsOfCurrentUser}) => ({
    chatIds: chatsOfCurrentUser.chatsOfCurrentUser,
    pending: chatsOfCurrentUser.pending
});

export const ChatsOfCurrentUserList = inject(mapMobxToProps)(observer(_ChatsOfCurrentUserList) as FunctionComponent);
