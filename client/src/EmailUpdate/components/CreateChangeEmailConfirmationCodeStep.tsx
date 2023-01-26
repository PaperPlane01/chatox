import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {DialogContent, DialogTitle, DialogActions, Button, CircularProgress, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {useStore, useLocalization} from "../../store";
import {commonStyles} from "../../style";

const useStyles = makeStyles(() => createStyles({
    centered: commonStyles.centered
}));

export const CreateChangeEmailConfirmationCodeStep: FunctionComponent = observer(() => {
    const {
        emailChangeConfirmationCode: {
            submitForm,
            pending,
            error,
            currentUserEmail
        },
        emailUpdate: {
            reset
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    return (
        <Fragment>
            <DialogTitle>
                {l("email.change.confirm")}
            </DialogTitle>
            <DialogContent>
                {pending
                    ? <CircularProgress size={30} color="primary" className={classes.centered}/>
                    : (
                        <Typography>
                            {l("email.change.confirm.code-will-be-sent", {email: currentUserEmail})}
                        </Typography>
                    )
                }
            </DialogContent>
            <DialogActions>
                <Button variant="contained"
                        color="primary"
                        disabled={pending}
                        onClick={submitForm}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("ok")}
                </Button>
                <Button variant="outlined"
                        color="secondary"
                        disabled={pending}
                        onClick={reset}
                >
                    {l("cancel")}
                </Button>
            </DialogActions>
        </Fragment>
    );
});