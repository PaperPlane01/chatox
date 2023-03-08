import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Dialog, Button, DialogContent, DialogTitle, DialogActions} from "@mui/material";
import {ChatRolesList} from "./ChatRolesList";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const ChatRolesDialog: FunctionComponent = observer(() => {
    const {
        rolesOfChats: {
            chatRolesDialogOpen,
            selectedChatId,
            setChatRolesDialogOpen,
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

    return (
        <Dialog open={chatRolesDialogOpen}
                onClose={() => setChatRolesDialogOpen(false)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="xs"
        >
            <DialogTitle>
                {l("chat-role.list", {chatName: chat.name})}
            </DialogTitle>
            <DialogContent>
                <ChatRolesList/>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setChatRolesDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
