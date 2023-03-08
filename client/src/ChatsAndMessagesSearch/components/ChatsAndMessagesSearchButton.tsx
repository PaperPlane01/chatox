import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {Search} from "@mui/icons-material";
import {useStore} from "../../store";

export const ChatsAndMessagesSearchButton: FunctionComponent = observer(() => {
    const {
        chatsAndMessagesSearchQuery: {
            setShowInput
        }
    } = useStore();

    return (
        <IconButton onClick={() => setShowInput(true)}
                    color="inherit"
                    size="large"
        >
            <Search/>
        </IconButton>
    );
});
