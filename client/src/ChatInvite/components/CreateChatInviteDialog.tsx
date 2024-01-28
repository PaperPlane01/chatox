import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle} from "@mui/material";
import {HttpStatusCode} from "axios";
import {ChatInviteForm} from "./ChatInviteForm";
import {ChatInviteCreationUserSelect} from "./ChatInviteCreationUserSelect";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("common.error.server-unreachable");
    } else if (error.status === HttpStatusCode.Forbidden) {
        return l("chat.invite.create.error.forbidden");
    } else {
        return l("chat.invite.create.error.unknown", {errorStatus: error.status});
    }
};

export const CreateChatInviteDialog: FunctionComponent = observer(() => {
    const {
        chatInviteCreation: {
            createChatInviteDialogOpen,
            formValues,
            formErrors,
            pending,
            error,
            setFormValue,
            setAllowance,
            setCreateChatInviteDialogOpen,
            submitForm
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={createChatInviteDialogOpen}
                onClose={() => setCreateChatInviteDialogOpen(false)}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
        >
            <DialogTitle>
                {l("chat.invite.create")}
            </DialogTitle>
            <DialogContent>
                <ChatInviteForm formValues={formValues}
                                formErrors={formErrors}
                                errorText={error && getErrorText(error, l)}
                                userSelectComponent={<ChatInviteCreationUserSelect/>}
                                setFormValue={setFormValue}
                                setAllowance={setAllowance}
                />
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="primary"
                        disabled={pending}
                        onClick={() => setCreateChatInviteDialogOpen(false)}
                >
                    {l("cancel")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        disabled={pending}
                        onClick={submitForm}
                >
                    {pending && <CircularProgress color="primary" size={15}/>}
                    {l("common.create")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
