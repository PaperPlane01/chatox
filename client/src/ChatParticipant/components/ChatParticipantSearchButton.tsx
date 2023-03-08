import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {Search} from "@mui/icons-material";
import {useStore} from "../../store";

export const ChatParticipantSearchButton: FunctionComponent = observer(() => {
    const {
        chatParticipantsSearch: {
            setInSearchMode
        }
    } = useStore();

    return (
        <IconButton onClick={() => setInSearchMode(true)}>
            <Search/>
        </IconButton>
    );
});
