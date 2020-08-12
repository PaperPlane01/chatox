import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Hidden, withMobileDialog} from "@material-ui/core";
import {ChatBlockingsTable} from "./ChatBlockingsTable";
import {ChatBlockingsList} from "./ChatBlockingsList";
import {ShowActiveOnlySwitch} from "./ShowActiveOnlySwitch";
import {useLocalization, useStore} from "../../store";

export const ChatBlockingsDialog: FunctionComponent = withMobileDialog()(observer(({fullScreen}) => {
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
                <Hidden mdDown>
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
    )
})) as FunctionComponent;
