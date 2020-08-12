import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControlLabel, Switch} from "@material-ui/core";
import {useLocalization, useStore} from "../../store";

interface ShowActiveOnlySwitchProps {
    chatId: string
}

export const ShowActiveOnlySwitch: FunctionComponent<ShowActiveOnlySwitchProps> = observer(({chatId}) => {
    const {l} = useLocalization();
    const {
        chatBlockingsOfChat: {
            getChatBlockingsOfChatState,
            setShowActiveOnly
        }
    } = useStore();
    const showActiveOnly = getChatBlockingsOfChatState(chatId).showActiveOnly;

    return (
        <FormControlLabel control={(
            <Switch checked={showActiveOnly}
                    onChange={() => setShowActiveOnly(!showActiveOnly)}
            />
        )}
                          label={l("chat.blocking.show-active-only")}
        />
    )
});
