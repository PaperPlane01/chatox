import React, {FunctionComponent} from "react";
import {observer, inject} from "mobx-react";
import {Switch, FormControlLabel} from "@material-ui/core";
import {ChatBlockingsOfChatState} from "../stores";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface ShowActiveOnlySwitchMobxProps {
    getChatBlockingsOfChatState: (chatId: string) => ChatBlockingsOfChatState,
    setShowActiveOnly: (showActiveOnly: boolean) => void
}

interface ShowActiveOnlySwitchOwnProps {
    chatId: string
}

type ShowActiveOnlySwitchProps = ShowActiveOnlySwitchMobxProps & ShowActiveOnlySwitchOwnProps & Localized;

const _ShowActiveOnlySwitch: FunctionComponent<ShowActiveOnlySwitchProps> = ({
    getChatBlockingsOfChatState,
    setShowActiveOnly,
    chatId,
    l
}) => {
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
};

const mapMobxToProps: MapMobxToProps<ShowActiveOnlySwitchMobxProps> = ({chatBlockingsOfChat}) => ({
    getChatBlockingsOfChatState: chatBlockingsOfChat.getChatBlockingsOfChatState,
    setShowActiveOnly: chatBlockingsOfChat.setShowActiveOnly
});

export const ShowActiveOnlySwitch = localized(
    inject(mapMobxToProps)(observer(_ShowActiveOnlySwitch))
) as FunctionComponent<ShowActiveOnlySwitchOwnProps>;
