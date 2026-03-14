import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Box} from "@mui/material";
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
       <Box sx={{
           display: {
               lg: "none",
               xs: "block",
           }
       }}>
           {showInput
               ? <ChatsAndMessagesSearchInput alwaysShowClearButton variant="standard"/>
               : <ChatsAndMessagesSearchButton/>
           }
       </Box>
    )
})