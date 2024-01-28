import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {HttpStatusCode} from "axios";
import {ChatInviteForm} from "./ChatInviteForm";
import {ChatInviteUpdateUserSelect} from "./ChatInviteUpdateUserSelect";
import {getChatInviteLink} from "../utils";
import {useEntities, useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorLabel = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("common.error.server-unreachable");
    } else if (error.status === HttpStatusCode.Forbidden) {
        return l("chat.invite.update.error.forbidden");
    } else {
        return l("chat.invite.update.error.unknown", {errorStatus: error.status});
    }
};

export const UpdateChatInviteDialog: FunctionComponent = observer(() => {
    const {
        chatInviteUpdate: {
            formValues,
            formErrors,
            pending,
            error,
            updateChatInviteDialogOpen,
            chatInviteId,
            setFormValue,
            setAllowance,
            setUpdateChatInviteDialogOpen,
            submitForm
        }
    } = useStore();
    const {
        chatInvites: {
            findById: findChatInvite
        }
    } = useEntities();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    if (!chatInviteId) {
        return null;
    }

    const invite = findChatInvite(chatInviteId);
    const link = getChatInviteLink(invite.id);

    return (
        <Dialog open={updateChatInviteDialogOpen}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
                onClose={() => setUpdateChatInviteDialogOpen(false)}
        >
            <DialogTitle>
                {l("chat.invite.update", {name: invite.name ?? link})}
            </DialogTitle>
            <DialogContent>
                <ChatInviteForm formValues={formValues}
                                formErrors={formErrors}
                                errorText={error && getErrorLabel(error, l)}
                                userSelectComponent={<ChatInviteUpdateUserSelect/>}
                                setFormValue={setFormValue}
                                setAllowance={setAllowance}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={() => setUpdateChatInviteDialogOpen(false)}
                        variant="outlined"
                        color="primary"
                        disabled={pending}
                >
                    {l("cancel")}
                </Button>
                <Button onClick={submitForm}
                        variant="contained"
                        color="primary"
                        disabled={pending}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("save-changes")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
