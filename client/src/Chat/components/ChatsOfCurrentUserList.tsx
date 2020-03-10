import React, {Fragment, FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {CircularProgress, createStyles, Divider, Hidden, List, makeStyles} from "@material-ui/core";
import {ChatsOfCurrentUserListItem} from "./ChatsOfCurrentUserListItem";
import {CreateChatFloatingActionButton} from "./CreateChatFloatingActionButton";
import {CreateChatDialog} from "./CreateChatDialog";
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
    chatListWrapper: {
        [theme.breakpoints.up("lg")]: {
            height: "calc(100vh - 64px)",
            width: 280,
            display: "flex"
        }
    },
    chatList: {
        [theme.breakpoints.up("lg")]: {
            flex: 1,
            overflowY: "auto"
        },
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

   return (
       <div className={classes.chatListWrapper}>
           <List className={classes.chatList}>
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
           <Hidden mdUp>
               <CreateChatFloatingActionButton/>
           </Hidden>
           <CreateChatDialog/>
       </div>
   )
};

const mapMobxToProps: MapMobxToProps<ChatsOfCurrentUserListMobxProps> = ({chatsOfCurrentUser}) => ({
    chatIds: chatsOfCurrentUser.chatsOfCurrentUser,
    pending: chatsOfCurrentUser.pending
});

export const ChatsOfCurrentUserList = inject(mapMobxToProps)(observer(_ChatsOfCurrentUserList) as FunctionComponent);
