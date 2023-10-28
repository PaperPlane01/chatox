import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader} from "@mui/material";
import {ChatBlockingsListWrapper} from "../../ChatBlocking";
import {useLocalization, useStore} from "../../store";
import {BaseSettingsTabProps} from "../../utils/types";

export const ChatBlockingsCard: FunctionComponent<BaseSettingsTabProps> = observer(({
    hideHeader
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
            {!hideHeader && <CardHeader title={l("chat.blocking.list", {chatName: selectedChat.name})}/>}
            <CardContent>
                <ChatBlockingsListWrapper/>
            </CardContent>
        </Card>
    );
});
