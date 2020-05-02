import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    WithMobileDialog,
    withMobileDialog
} from "@material-ui/core";
import {ChatBlockingsTable} from "./ChatBlockingsTable";
import {localized, Localized} from "../../localization";
import {ChatOfCurrentUserEntity} from "../../Chat/types";
import {MapMobxToProps} from "../../store";
import {ShowActiveOnlySwitch} from "./ShowActiveOnlySwitch";

interface ChatBlockingsDialogMobxProps {
    chatBlockingsDialogOpen: boolean,
    selectedChatId?: string,
    setChatBlockingsDialogOpen: (chatBlockingsDialogOpen: boolean) => void,
    findChat: (id: string) => ChatOfCurrentUserEntity
}

type ChatBlockingsDialogProps = ChatBlockingsDialogMobxProps & Localized & WithMobileDialog;

const _ChatBlockingsDialog: FunctionComponent<ChatBlockingsDialogProps> = ({
    chatBlockingsDialogOpen,
    selectedChatId,
    findChat,
    setChatBlockingsDialogOpen,
    l,
    fullScreen
}) => {
    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    const handleClose = (): void => {
        setChatBlockingsDialogOpen(false);
    };

    return (
        <Dialog open={chatBlockingsDialogOpen}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="lg"
                onClose={handleClose}
        >
            <DialogTitle>
                {l("chat.blocking.list", {chatName: chat.name})}
            </DialogTitle>
            <DialogContent>
                <ShowActiveOnlySwitch chatId={chat.id}/>
                <ChatBlockingsTable/>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={handleClose}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    )
};

const mapMobxToProps: MapMobxToProps<ChatBlockingsDialogMobxProps> = ({
    chat,
    chatBlockingsDialog,
    entities
}) => ({
    chatBlockingsDialogOpen: chatBlockingsDialog.chatBlockingsDialogOpen,
    selectedChatId: chat.selectedChatId,
    setChatBlockingsDialogOpen: chatBlockingsDialog.setChatBlockingsDialogOpen,
    findChat: entities.chats.findById
});

export const ChatBlockingsDialog = localized(
    withMobileDialog()(
        inject(mapMobxToProps)(observer(_ChatBlockingsDialog))
    )
) as FunctionComponent;
