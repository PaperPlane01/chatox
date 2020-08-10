import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress} from "@material-ui/core";
import {useSnackbar} from "notistack";
import {useLocalization, useStore} from "../../store";

export const JoinChatButton: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        joinChat: {
            error,
            showSnackbar,
            pending,
            joinChat: doJoinChat,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    if (error && showSnackbar) {
        enqueueSnackbar(l("chat.join.error", {variant: "error"}));
        setShowSnackbar(false);
    }

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
    )
});
