import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import {CreateChatRoleForm} from "./CreateChatRoleForm";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const CreateChatRoleDialog: FunctionComponent = observer(() => {
    const {
        createChatRole: {
            pending,
            createChatRoleDialogOpen,
            selectedChat,
            submitForm,
            openRolesList,
            setCreateChatRoleDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={createChatRoleDialogOpen}
                fullWidth
                fullScreen={fullScreen}
                maxWidth="md"
                onClose={() => setCreateChatRoleDialogOpen(false)}
        >
            <DialogTitle>
                <IconButton onClick={openRolesList}>
                    <ArrowBack/>
                </IconButton>
                {selectedChat
                    ? l("chat.role.create.with-chat-name", {chatName: selectedChat.name})
                    : l("chat.role.create")
                }
            </DialogTitle>
            <DialogContent>
                <CreateChatRoleForm/>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={openRolesList}
                        disabled={pending}
                >
                    {l("cancel")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={submitForm}
                        disabled={pending}
                >
                    {l("common.create")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
