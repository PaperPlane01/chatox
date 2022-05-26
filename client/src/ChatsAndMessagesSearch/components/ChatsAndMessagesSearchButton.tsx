import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@material-ui/core";
import {Search} from "@material-ui/icons";
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
        >
            <Search/>
        </IconButton>
    );
});
