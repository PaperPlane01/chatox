import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, DialogActions, DialogContent, DialogTitle} from "@material-ui/core";
import {useLocalization, useStore} from "../../store/hooks";

export const PasswordRecoveryCompletedStep: FunctionComponent = observer(() => {
    const {
        passwordRecoveryDialog: {
            setPasswordRecoveryDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <DialogTitle>
                {l("password-recovery.password-updated")}
            </DialogTitle>
            <DialogContent>
                {l("password-recovery.log-in")}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setPasswordRecoveryDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Fragment>
    )
});
