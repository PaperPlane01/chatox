import React, {Fragment, FunctionComponent} from "react";
import {Dialog, DialogTitle, DialogContent, DialogActions, Button, CircularProgress, TextField, Typography} from "@material-ui/core";
import {ReportReasonSelect} from "./ReportReasonSelect";
import {CreateReportFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {useLocalization} from "../../store/hooks";
import {useMobileDialog} from "../../utils/hooks";
import {observer} from "mobx-react";

interface CreateReportDialogProps {
    formValues: CreateReportFormData,
    formErrors: FormErrors<CreateReportFormData>,
    error?: ApiError,
    showSuccessMessage: boolean,
    pending: boolean,
    open: boolean,
    title: string,
    onSubmit: () => void,
    onClose: () => void,
    onFormValueChange: <Key extends keyof CreateReportFormData>(key: Key, value: CreateReportFormData[Key]) => void
}

export const CreateReportDialog: FunctionComponent<CreateReportDialogProps> = observer(({
    formValues,
    formErrors,
    error,
    showSuccessMessage,
    open,
    pending,
    title,
    onSubmit,
    onClose,
    onFormValueChange
}) => {
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={open}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
                onClose={onClose}
        >
            <DialogTitle>
                {title}
            </DialogTitle>
            <DialogContent>
                {showSuccessMessage
                    ? <Typography>{l("report.submit.success")}</Typography>
                    : (
                        <Fragment>
                            <ReportReasonSelect value={formValues.reason}
                                                onSelect={reason => onFormValueChange("reason", reason)}
                            />
                            <TextField value={formValues.description}
                                       onChange={event => onFormValueChange("description", event.target.value)}
                                       label={l("report.description")}
                                       error={Boolean(formErrors.description)}
                                       helperText={formErrors.description && l(formErrors.description)}
                                       fullWidth
                                       multiline
                                       rows={4}
                                       rowsMax={4}
                                       margin="dense"
                            />
                            {error && (
                                <Typography style={{color: "red"}}>
                                    {error.status === API_UNREACHABLE_STATUS
                                        ? l("server.unreachable")
                                        : l("report.submit.error", {errorStatus: error.status})
                                    }
                                </Typography>
                            )}
                        </Fragment>
                    )
                }
            </DialogContent>
            <DialogActions>
                {showSuccessMessage
                    ? <Button variant="contained" color="primary" onClick={onClose}>{l("ok")}</Button>
                    : (
                        <Fragment>
                            <Button variant="outlined"
                                    color="secondary"
                                    onClick={onClose}
                            >
                                {l("close")}
                            </Button>
                            <Button variant="contained"
                                    color="primary"
                                    onClick={onSubmit}
                                    disabled={pending}
                            >
                                {pending && <CircularProgress size={15} color="primary"/>}
                                {l("report.submit")}
                            </Button>
                        </Fragment>
                    )
                }
            </DialogActions>
        </Dialog>
    );

});
