import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Typography} from "@mui/material";
import {DateTimePicker} from "@mui/x-date-pickers";
import {addMinutes, addMonths} from "date-fns";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorText = (error: ApiError, l: TranslationFunction): string | undefined => {
    if (error.metadata && error.metadata.errorCode) {
        if (error.metadata.errorCode === "LIMIT_OF_SCHEDULED_MESSAGES_REACHED") {
            return l("message.delayed-message.limit-reached");
        } else if (error.metadata.errorCode === "SCHEDULED_MESSAGE_IS_TOO_CLOSE_TO_ANOTHER_SCHEDULED_MESSAGE") {
            return l("message.delayed-message.is-too-close-to-other-delayed-message");
        }
    }

    return undefined;
}

export const ScheduleMessageDialog: FunctionComponent = observer(() => {
    const {
        scheduleMessage: {
            scheduledAt,
            scheduledAtValidationError,
            submissionError,
            scheduleMessageDialogOpen,
            setScheduleMessageDialogOpen,
            setScheduledAt,
            cancelMessageScheduling
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={scheduleMessageDialogOpen}
                onClose={() => setScheduleMessageDialogOpen(false)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
        >
            <DialogTitle>
                {l("message.delayed-message.create")}
            </DialogTitle>
            <DialogContent>
                <DateTimePicker value={scheduledAt}
                                onChange={date => date ? setScheduledAt(date) : setScheduledAt(undefined)}
                                openTo="day"
                                inputFormat="dd MMMM yyyy HH:mm"
                                minDate={addMinutes(new Date(), 5)}
                                maxDate={addMonths(new Date(), 1)}
                                disablePast
                                ampm={false}
                                renderInput={props => (
                                    <TextField {...props}
                                               fullWidth
                                               margin="dense"
                                               error={Boolean(
                                                   scheduledAtValidationError
                                                   || (submissionError && submissionError.metadata
                                                       && submissionError.metadata.errorCode
                                                       && submissionError.metadata.errorCode === "SCHEDULED_MESSAGE_IS_TOO_CLOSE_TO_ANOTHER_SCHEDULED_MESSAGE")
                                               )}
                                               helperText={scheduledAtValidationError && l(scheduledAtValidationError)}
                                    />
                                )}
                />
                {submissionError && (
                    <Typography style={{color: "red"}}>
                        {getErrorText(submissionError, l)}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button variant="outlined"
                        color="secondary"
                        onClick={cancelMessageScheduling}
                >
                    {l("cancel")}
                </Button>
                <Button variant="contained"
                        color="primary"
                        onClick={() => setScheduleMessageDialogOpen(false)}
                >
                    {l("ok")}
                </Button>
            </DialogActions>
        </Dialog>
    );
});
