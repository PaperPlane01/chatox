import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton} from "@mui/material";
import {ArrowBack, Edit} from "@mui/icons-material";
import {ChatRoleFeatures} from "./ChatRoleFeatures";
import {EditChatRoleForm} from "./EditChatRoleForm";
import {getChatRoleTranslation} from "../utils";
import {useLocalization, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {useMobileDialog} from "../../utils/hooks";

export const ChatRoleInfoDialog: FunctionComponent = observer(() => {
    const {
        chatRoleInfo: {
            chatRoleInfoDialogOpen,
            roleId,
            editMode,
            closeDialog,
            setEditMode
        },
        editChatRole: {
            pending,
            setRoleId,
            submitForm,
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();
    const chatRole = useEntityById("chatRoles", roleId);

    if (!chatRole) {
        return null;
    }

    const handleClose = (): void => {
        closeDialog();
    };

    const handleBackClick = (): void => {
        if (editMode) {
            setEditMode(false);
        } else {
            handleClose();
        }
    };

    const handleEditClick = (): void => {
        setEditMode(true);
        setRoleId(roleId);
    };

    return (
        <Dialog open={chatRoleInfoDialogOpen}
                fullWidth
                maxWidth="lg"
                fullScreen={fullScreen}
                onClose={handleClose}
        >
            <DialogTitle>
                <IconButton onClick={handleBackClick}>
                    <ArrowBack/>
                </IconButton>
                {editMode
                    ? l("chat.role.update", {roleName: getChatRoleTranslation(chatRole.name, l)})
                    : l("chat.role.with-level", {roleName: getChatRoleTranslation(chatRole.name, l), level: chatRole.level})
                }
                {!editMode && (
                    <IconButton style={{float: "right"}}
                                onClick={handleEditClick}
                    >
                        <Edit/>
                    </IconButton>
                )}
            </DialogTitle>
            <DialogContent>
                {editMode
                    ? <EditChatRoleForm/>
                    : <ChatRoleFeatures role={chatRole}/>
                }
            </DialogContent>
            <DialogActions>
                {editMode
                    ? (
                        <Fragment>
                            <Button variant="outlined"
                                    color="secondary"
                                    onClick={handleBackClick}
                            >
                                {l("cancel")}
                            </Button>
                            <Button variant="contained"
                                    color="primary"
                                    onClick={submitForm}
                                    disabled={pending}
                            >
                                {pending && (
                                    <CircularProgress size={15} color="primary"/>
                                )}
                                {l("save-changes")}
                            </Button>
                        </Fragment>
                    )
                    : (
                        <Button onClick={handleClose}
                                variant="outlined"
                                color="secondary"
                        >
                            {l("close")}
                        </Button>
                    )
                }
            </DialogActions>
        </Dialog>
    );
});
