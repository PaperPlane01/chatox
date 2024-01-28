import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress} from "@mui/material";
import {useLocalization, useStore} from "../../store";

export const JoinChatButton: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        joinChat: {
            pending,
            joinChat: doJoinChat,
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (selectedChatId) {
            doJoinChat(selectedChatId);
        }
    };

    return (
        <Button variant="text"
                color="primary"
                fullWidth
                disabled={pending}
                onClick={handleClick}
        >
            {pending && <CircularProgress size={15} color="primary"/>}
            {l("chat.join")}
        </Button>
    );
});
