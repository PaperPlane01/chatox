import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {CircularProgress, List} from "@mui/material";
import {ChatRolesListItem} from "./ChatRolesListItem";
import {CreateChatRoleButton} from "./CreateChatRoleButton";
import {useStore, usePermissions} from "../../store";

export const ChatRolesList: FunctionComponent = observer(() => {
    const {
        rolesOfChats: {
            pending,
            rolesIdsOfCurrentChat,
            selectedChatId
        }
    } = useStore();
    const {
       chatRoles: {
           canCreateChatRole
       }
    } = usePermissions();

    if (!selectedChatId) {
        return null;
    }

    if (pending) {
        return <CircularProgress size={25} color="primary"/>
    }

    return (
       <Fragment>
           <List>
               {rolesIdsOfCurrentChat.map(roleId => (
                   <ChatRolesListItem chatRoleId={roleId} key={roleId}/>
               ))}
           </List>
           {canCreateChatRole(selectedChatId) && (
               <CreateChatRoleButton/>
           )}
       </Fragment>
    );
});