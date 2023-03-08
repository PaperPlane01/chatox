import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, DialogActions, DialogContent, DialogTitle, Typography} from "@mui/material";
import {StatusCodes} from "http-status-codes";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";
import {useLocalization, useStore} from "../../store";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    switch (error.status) {
        case API_UNREACHABLE_STATUS:
            return l("server.unreachable");
        case StatusCodes.FORBIDDEN:
            if (error.metadata && error.metadata.errorCode && error.metadata.errorCode === "EMAIL_MISMATCH") {
                return l("email.update.error.email-mismatch");
            } else {
                return l("email.update.error.unknown", {errorStatus: error.status});
            }
        case StatusCodes.NOT_FOUND:
            return l("email.update.error.confirmation-code-invalid");
        case StatusCodes.GONE:
            if (!error.metadata) {
                return l("email.update.error.unknown", {errorStatus: error.status});
            }

            const errorCode = error.metadata.errorCode;

            if (errorCode === "EMAIL_CONFIRMATION_CODE_EXPIRED") {
                return l("email.update.error.confirmation-code-expired");
            } else if (errorCode === "EMAIL_CONFIRMATION_CODE_HAS_BEEN_USED") {
                return l("email.update.error.confirmation-code-has-been-used");
            } else {
                return l("email.update.error.unknown", {errorStatus: error.status});
            }
        default:
            return l("email.update.error.unknown", {errorStatus: error.status});
    }
};

export const UpdateEmailErrorStep: FunctionComponent = observer(() => {
    const {
        emailUpdate: {
            error,
            reset
        }
    } = useStore();
    const {l} = useLocalization();

    if (!error) {
        return null;
    }

    const errorText = getErrorText(error, l);

    return (
        <Fragment>
            <DialogTitle>
                {l("email.update.error")}
            </DialogTitle>
            <DialogContent>
                <Typography>
                    {errorText}
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={reset}
                >
                    {l("close")}
                </Button>
            </DialogActions>
        </Fragment>
    );
});