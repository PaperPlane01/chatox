import React, {FunctionComponent} from "react";
import {Button, CircularProgress} from "@material-ui/core";
import {withSnackbar, WithSnackbarProps} from "notistack";
import {localized, Localized} from "../../localization";
import {ApiError} from "../../api";
import {MapMobxToProps} from "../../store";
import {inject, observer} from "mobx-react";

interface JoinChatButtonMobxProps {
    selectedChatId?: string,
    pending: boolean,
    error?: ApiError,
    showSnackbar: boolean,
    setShowSnackbar: (showSnackbar: boolean) => void,
    joinChat: (chatId: string) => void,
}

type JoinChatButtonProps = JoinChatButtonMobxProps & Localized & WithSnackbarProps;

const _JoinChatButton: FunctionComponent<JoinChatButtonProps> = ({
    selectedChatId,
    pending,
    error,
    showSnackbar,
    setShowSnackbar,
    joinChat,
    enqueueSnackbar,
    l
}) => {
    if (error && showSnackbar) {
        enqueueSnackbar(l("chat.join.error", {variant: "error"}));
        setShowSnackbar(false);
    }

    const handleClick = (): void => {
        if (selectedChatId) {
            joinChat(selectedChatId);
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
};

const mapMobxToProps: MapMobxToProps<JoinChatButtonMobxProps> = ({chat, joinChat}) => ({
    selectedChatId: chat.selectedChatId,
    pending: joinChat.pending,
    error: joinChat.error,
    showSnackbar: joinChat.showSnackbar,
    joinChat: joinChat.joinChat,
    setShowSnackbar: joinChat.setShowSnackbar
})

export const JoinChatButton = localized(
    withSnackbar(
        inject(mapMobxToProps)(observer(_JoinChatButton))
    )
) as FunctionComponent;
