import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {Dialog, DialogContent, DialogActions, DialogTitle, Button, CircularProgress, TextField, Typography} from "@material-ui/core";
import {ReportReasonSelect} from "./ReportReasonSelect";
import {useLocalization, useStore} from "../../store/hooks";
import {useMobileDialog} from "../../utils/hooks";
import {API_UNREACHABLE_STATUS} from "../../api";

export const ReportMessageDialog: FunctionComponent = observer(() => {
    const {
        reportMessage: {
            reportedObjectId,
            formValues,
            formErrors,
            showSuccessMessage,
            error,
            pending,
            setShowSuccessMessage,
            setReportedObjectId,
            setFormValue,
            submitForm
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    const handleClose = (): void => {
        setReportedObjectId(undefined);
        setShowSuccessMessage(false);
    };

    return (
        <Dialog open={Boolean(reportedObjectId)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
                onClose={handleClose}
        >
            <DialogTitle>
                {l("report.message")}
            </DialogTitle>
            <DialogContent>
                {showSuccessMessage
                    ? <Typography>{l("report.submit.success")}</Typography>
                    : (
                        <Fragment>
                            <ReportReasonSelect value={formValues.reason}
                                                onSelect={reason => setFormValue("reason", reason)}
                            />
                            <TextField value={formValues.description}
                                       onChange={event => setFormValue("description", event.target.value)}
                                       label={l("report.description")}
                                       error={Boolean(formErrors.description)}
                                       helperText={formErrors.description && l(formErrors.description)}
                                       fullWidth
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
                    ? <Button variant="contained" color="primary" onClick={handleClose}>{l("ok")}</Button>
                    : (
                        <Fragment>
                            <Button variant="outlined"
                                    color="secondary"
                                    onClick={handleClose}
                            >
                                {l("close")}
                            </Button>
                            <Button variant="contained"
                                    color="primary"
                                    onClick={submitForm}
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
