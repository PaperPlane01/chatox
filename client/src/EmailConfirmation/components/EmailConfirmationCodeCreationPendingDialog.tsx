import React, {FunctionComponent, useEffect, useState} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    createStyles,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    makeStyles,
    Typography
} from "@material-ui/core";
import {useLocalization} from "../../store/hooks";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization/types";

interface EmailConfirmationCodeCreationPendingDialogProps {
    pending: boolean,
    error?: ApiError
}

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%"
    }
}));

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("email-confirmation-code.creation.error.server-unreachable");
    } else {
        return l("email-confirmation-code.creation.error", {errorStatus: error.status})
    }
}

export const EmailConfirmationCodeCreationPendingDialog: FunctionComponent<EmailConfirmationCodeCreationPendingDialogProps>
    = observer(({pending, error}) => {
        const [open, setOpen] = useState(false);
        const [closable, setClosable] = useState(false);
        const {l} = useLocalization();
        const classes = useStyles();

        useEffect(
            () => setClosable(Boolean(error)),
            [error]
        );

        useEffect(
            () => setOpen(Boolean(pending || error)),
            [pending, error]
        );

        const handleClose = (): void => {
            if (closable) {
                setOpen(false);
            }
        }

        return  (
            <Dialog open={open}
                    onClose={handleClose}
                    fullWidth
                    maxWidth="md"
            >
                <DialogTitle>
                    {l("email-confirmation-code.creation.pending")}
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        {l("email-confirmation-code.creation.might-take-a-while")}
                    </Typography>
                    {pending && (
                        <div className={classes.centered}>
                            <CircularProgress size={30} color="primary"/>
                        </div>
                    )}
                    {error && (
                        <Typography style={{color: "red"}}>
                            {getErrorText(error, l)}
                        </Typography>
                    )}
                </DialogContent>
                {closable && (
                    <DialogActions>
                        <Button variant="outlined"
                                color="secondary"
                                onClick={handleClose}
                        >
                            {l("close")}
                        </Button>
                    </DialogActions>
                )}
            </Dialog>
        )
    });
