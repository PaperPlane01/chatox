import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Hidden} from "@mui/material";
import {ChatsAndMessagesSearchButton} from "./ChatsAndMessagesSearchButton";
import {ChatsAndMessagesSearchInput} from "./ChatsAndMessagesSearchInput";
import {useStore} from "../../store";

export const ChatsAndMessagesSearchInputWrapper: FunctionComponent = observer(() => {
    const {
        chatsAndMessagesSearchQuery: {
            showInput
        }
    } = useStore();

    return (
        <Hidden lgUp>
            {showInput
                ? <ChatsAndMessagesSearchInput alwaysShowClearButton variant="standard"/>
                : <ChatsAndMessagesSearchButton/>
            }
        </Hidden>
    )
})