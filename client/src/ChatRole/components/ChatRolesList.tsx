import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, List} from "@mui/material";
import {ChatRolesListItem} from "./ChatRolesListItem";
import {useStore} from "../../store";

export const ChatRolesList: FunctionComponent = observer(() => {
    const {
        rolesOfChats: {
            pending,
            rolesIdsOfCurrentChat
        }
    } = useStore();

    if (pending) {
        return <CircularProgress size={25} color="primary"/>
    }

    return (
        <List>
            {rolesIdsOfCurrentChat.map(roleId => (
                <ChatRolesListItem chatRoleId={roleId} key={roleId}/>
            ))}
        </List>
    );
});