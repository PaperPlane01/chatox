import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Link} from "mobx-router";
import {ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {getAvatarLabel} from "../utils";
import {useRouter} from "../../store";
import {useEntityById} from "../../entities";
import {commonStyles} from "../../style";
import {Routes} from "../../router";
import {Avatar} from "../../Avatar";

interface PendingChatListItemProps {
    chatId: string
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: commonStyles.undecoratedLink
}));

export const PendingChatsListItem: FunctionComponent<PendingChatListItemProps> = observer(({
    chatId
}) => {
    const classes = useStyles();
    const router = useRouter();

    const chat = useEntityById("chats", chatId);
    const avatarLabel = getAvatarLabel(chat.name);
    const avatarColor = randomColor({seed: chat.id});

    return (
       <Link route={Routes.chatPage}
             router={router}
             params={{slug: chat.slug ?? chat.id}}
             className={classes.undecoratedLink}
       >
           <ListItem>
               <ListItemAvatar>
                   <Avatar avatarLetter={avatarLabel} avatarColor={avatarColor}/>
               </ListItemAvatar>
               <ListItemText>
                   {chat.name}
               </ListItemText>
           </ListItem>
       </Link>
    );
});
