import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Box,
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField
} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const ConfirmationTokenDialog: FunctionComponent = observer(() => {
    const {
        confirmationTokenDialog: {
            createConfirmationTokenDialogOpen,
            formValues,
            formErrors,
            pending,
            closeDialog,
            setFormValue,
            submitForm
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={createConfirmationTokenDialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
        >
            <DialogTitle>
                {l("confirmation.token.dialog.title")}
            </DialogTitle>
            <DialogContent>
                <Box sx={{
                    pt: 1,
                    pb: 1
                }}>
                    <TextField value={formValues.password}
                               onChange={event => setFormValue("password", event.target.value)}
                               label={l("password")}
                               type="password"
                               fullWidth
                               error={Boolean(formErrors.password)}
                               helperText={formErrors.password && l(formErrors.password)}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={closeDialog}
                >
                    {l("cancel")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={submitForm}
                        disabled={pending}
                >
                    {pending && <CircularProgress color="primary" size={15}/>}
                    {l("common.confirm")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
