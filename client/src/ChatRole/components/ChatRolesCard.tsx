import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardHeader, CardContent} from "@mui/material";
import {ChatRolesList} from "./ChatRolesList";
import {BaseSettingsTabProps} from "../../utils/types";
import {useLocalization, useStore} from "../../store";

export const ChatRolesCard: FunctionComponent<BaseSettingsTabProps> = observer(({
    hideHeader = false
}) => {
    const {
        chat: {
            selectedChat
        }
    } = useStore();
    const {l} = useLocalization();

    if (!selectedChat) {
        return null;
    }

    return (
        <Card>
            {!hideHeader && <CardHeader title={l("chat-role.list", {chatName: selectedChat.name})}/>}
            <CardContent>
                <ChatRolesList/>
            </CardContent>
        </Card>
    );
});
