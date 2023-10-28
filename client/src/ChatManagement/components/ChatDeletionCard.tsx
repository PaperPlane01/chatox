import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader} from "@mui/material";
import {DeleteChatButton} from "./DeleteChatButton";
import {useLocalization} from "../../store";
import {BaseSettingsTabProps} from "../../utils/types";

export const ChatDeletionCard: FunctionComponent<BaseSettingsTabProps> = observer(({
    hideHeader = false
}) => {
    const {l} = useLocalization();

    return (
        <Card>
            {!hideHeader && <CardHeader title={l("chat.delete")}/>}
            <CardContent>
                <DeleteChatButton/>
            </CardContent>
        </Card>
    );
});
