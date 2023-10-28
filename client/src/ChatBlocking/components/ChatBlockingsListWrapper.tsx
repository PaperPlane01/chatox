import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ShowActiveOnlySwitch} from "./ShowActiveOnlySwitch";
import {Hidden} from "@mui/material";
import {ChatBlockingsList} from "./ChatBlockingsList";
import {ChatBlockingsTable} from "./ChatBlockingsTable";
import {useStore} from "../../store";

export const ChatBlockingsListWrapper: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChat
        }
    } = useStore();

    if (!selectedChat) {
        return null;
    }

    return (
        <Fragment>
            <ShowActiveOnlySwitch chatId={selectedChat.id}/>
            <Hidden lgUp>
                <ChatBlockingsList/>
            </Hidden>
            <Hidden lgDown>
                <ChatBlockingsTable/>
            </Hidden>
        </Fragment>
    );
});
