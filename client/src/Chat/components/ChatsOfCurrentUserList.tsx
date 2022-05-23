import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, Divider, List} from "@material-ui/core";
import {ChatsOfCurrentUserListItem} from "./ChatsOfCurrentUserListItem";
import {useStore} from "../../store";
import {ChatsOfCurrentUserListProps} from "../types";

export const ChatsOfCurrentUserList: FunctionComponent<ChatsOfCurrentUserListProps> = observer(({classes}) => {
    const {
        chatsOfCurrentUser: {
            chatsOfCurrentUser,
            pending
        },
    } = useStore();

    if (pending) {
        return (
            <div className={classes && classes.circularProgress}>
                <CircularProgress size={40} color="primary"/>
            </div>
        )
    }

   return (
       <List className={classes && classes.list}
       >
           {chatsOfCurrentUser.map(({chatId, messageId}) => (
               <Fragment key={chatId}>
                   <ChatsOfCurrentUserListItem chatId={chatId}
                                               messageId={messageId}
                                               key={chatId}
                                               linkGenerationStrategy="chat"
                   />
                   <Divider variant="inset"/>
               </Fragment>
           ))}
       </List>
   )
});
