import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Hidden} from "@mui/material";
import {ChatBlockingsTable} from "./ChatBlockingsTable";
import {ChatBlockingsList} from "./ChatBlockingsList";
import {ShowActiveOnlySwitch} from "./ShowActiveOnlySwitch";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const ChatBlockingsDialog: FunctionComponent = observer(() => {
    const {
        chat: {
            selectedChatId
        },
        chatBlockingsDialog: {
            chatBlockingsDialogOpen,
            setChatBlockingsDialogOpen
        },
        entities: {
            chats: {
                findById: findChat
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

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
                <Hidden lgUp>
                    <ChatBlockingsList/>
                </Hidden>
                <Hidden lgDown>
                    <ChatBlockingsTable/>
                </Hidden>
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
    );
});
