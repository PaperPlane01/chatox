import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Forward} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

interface ForwardMessageMenuItemProps {
    messageId: string,
    onClick?: () => void
}

export const ForwardMessageMenuItem: FunctionComponent<ForwardMessageMenuItemProps> = observer(({
    messageId,
    onClick
}) => {
   const {
       messagesForwarding: {
           addMessage,
           setForwardedFromChatId
       },
       chat: {
           selectedChatId
       }
   } = useStore();
   const {l} = useLocalization();

   const handleClick = (): void => {
       if (onClick) {
           onClick();
       }

       setForwardedFromChatId(selectedChatId);
       addMessage(messageId);
   };

   return (
       <MenuItem onClick={handleClick}>
           <ListItemIcon>
               <Forward/>
           </ListItemIcon>
           <ListItemText>
               {l("message.forward")}
           </ListItemText>
       </MenuItem>
   );
});