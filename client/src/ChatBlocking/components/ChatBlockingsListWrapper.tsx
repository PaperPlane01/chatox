import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ShowActiveOnlySwitch} from "./ShowActiveOnlySwitch";
import {Box} from "@mui/material";
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
            <Box sx={{
                display: {
                    lg: "none",
                    md: "block"
                }
            }}>
                <ChatBlockingsList/>
            </Box>
            <Box sx={{
                display: {
                    md: "none",
                    lg: "block"
                }
            }}>
                <ChatBlockingsTable/>
            </Box>
        </Fragment>
    );
});
