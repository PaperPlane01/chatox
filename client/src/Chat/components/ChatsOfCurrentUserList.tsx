import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, Divider, List} from "@mui/material";
import {ChatsOfCurrentUserListItem} from "./ChatsOfCurrentUserListItem";
import {ChatsOfCurrentUserListProps} from "../types";
import {useStore} from "../../store";

export const ChatsOfCurrentUserList: FunctionComponent<ChatsOfCurrentUserListProps> = observer(({classes}) => {
    const {
        chatsOfCurrentUser: {
            chatsOfCurrentUser,
            pending
        },
    } = useStore();

    if (pending) {
        return (
            <div className={classes?.circularProgress}>
                <CircularProgress size={40} color="primary"/>
            </div>
        );
    }

   return (
       <List className={classes?.list}>
           {chatsOfCurrentUser.map(({chatId, messageId, draftMessageId}) => (
               <Fragment key={chatId}>
                   <ChatsOfCurrentUserListItem chatId={chatId}
                                               messageId={messageId}
                                               draftMessageId={draftMessageId}
                                               key={chatId}
                                               linkGenerationStrategy="chat"
                   />
                   <Divider variant="inset"/>
               </Fragment>
           ))}
       </List>
   );
});
