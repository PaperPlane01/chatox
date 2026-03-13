import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {useMediaQuery, useTheme} from "@mui/material";
import {ShowActiveOnlySwitch} from "./ShowActiveOnlySwitch";
import {ChatBlockingsList} from "./ChatBlockingsList";
import {ChatBlockingsTable} from "./ChatBlockingsTable";
import {useStore} from "../../store";

export const ChatBlockingsListWrapper: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChat
        }
    } = useStore();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    if (!selectedChat) {
        return null;
    }

    return (
        <Fragment>
            <ShowActiveOnlySwitch chatId={selectedChat.id}/>
            {onSmallScreen && <ChatBlockingsList/>}
            {!onSmallScreen && <ChatBlockingsTable/>}
        </Fragment>
    );
});
