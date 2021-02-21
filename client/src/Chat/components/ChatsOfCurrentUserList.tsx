import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, createStyles, Divider, Hidden, List, makeStyles, Theme} from "@material-ui/core";
import {ChatsOfCurrentUserListItem} from "./ChatsOfCurrentUserListItem";
import {CreateChatFloatingActionButton} from "./CreateChatFloatingActionButton";
import {CreateChatDialog} from "./CreateChatDialog";
import {canCreateChat} from "../permissions";
import {useStore} from "../../store";

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
            width: 280,
            display: "flex",
        },
        [theme.breakpoints.down("md")]: {
            width: "100%"
        }
    },
    chatList: {
        [theme.breakpoints.up("lg")]: {
            flex: 1,
            overflowY: "auto"
        }
    },
    padding: {
        paddingTop: 0,
        paddingBottom: 0
    }
}));

export const ChatsOfCurrentUserList: FunctionComponent = observer(() => {
    const {
        chatsOfCurrentUser: {
            chatsOfCurrentUser: chatIds,
            pending
        },
        authorization
    } = useStore();
    const classes = useStyles();

    if (pending) {
        return (
            <div className={classes.centered}>
                <CircularProgress size={40} color="primary"/>
            </div>
        )
    }

   return (
       <div className={classes.chatListWrapper}>
           <List className={classes.chatList}
                 classes={{
                     padding: classes.padding
                 }}
           >
               {chatIds.map(chatId => (
                   <Fragment key={chatId}>
                       <ChatsOfCurrentUserListItem chatId={chatId}
                                                   key={chatId}
                       />
                       <Divider variant="inset"/>
                   </Fragment>
               ))}
           </List>
           <Hidden mdUp>
               {canCreateChat(authorization) && <CreateChatFloatingActionButton/>}
           </Hidden>
           <CreateChatDialog/>
       </div>
   )
});
