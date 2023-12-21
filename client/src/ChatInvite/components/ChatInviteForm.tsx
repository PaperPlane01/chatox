import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {FormControlLabel, Switch, TextField, Typography} from "@mui/material";
import {DateTimePicker} from "@mui/x-date-pickers";
import {ChatInviteFormData} from "../types";
import {JoinChatAllowanceForm} from "../../JoinChatAllowanceForm";
import {useLocalization} from "../../store";
import {FormErrors} from "../../utils/types";
import {JoinChatAllowance, UserVerificationLevel} from "../../api/types/response";

interface ChatInviteFormProps {
    formValues: ChatInviteFormData,
    formErrors: FormErrors<ChatInviteFormData>,
    errorText?: string,
    setFormValue: <Key extends keyof ChatInviteFormData>(key: Key, value: ChatInviteFormData[Key]) => void,
    setAllowance: (verificationLevel: UserVerificationLevel, joinChatAllowance: JoinChatAllowance) => void,
    userSelectComponent?: ReactNode
}

export const ChatInviteForm: FunctionComponent<ChatInviteFormProps> = observer(({
    formValues,
    formErrors,
    errorText,
    setFormValue,
    setAllowance,
    userSelectComponent = null
}) => {
    const {l} = useLocalization();

    return (
        <Fragment>
            <TextField label={l("chat.invite.max-use-times")}
                       value={formValues.maxUseTimes}
                       error={Boolean(formErrors.maxUseTimes)}
                       helperText={formErrors.maxUseTimes && l(formErrors.maxUseTimes)}
                       onChange={event => setFormValue("maxUseTimes", event.target.value)}
                       variant="outlined"
                       fullWidth
                       margin="dense"
            />
            <DateTimePicker onChange={date => setFormValue("expiresAt", date ? date : undefined)}
                            value={formValues.expiresAt || null}
                            disablePast
                            inputFormat="dd MMMM yyyy HH:mm"
                            ampm={false}
                            renderInput={props => (
                                <TextField {...props}
                                           label={l("chat.invite.expires-at")}
                                           fullWidth
                                           margin="dense"
                                />
                            )}
            />
            {userSelectComponent && userSelectComponent}
            <JoinChatAllowanceForm formValues={formValues.joinAllowanceSettings}
                                   setValue={setAllowance}
                                   wrapWithBorder
                                   label="chat.invite.usage"
            />
            <FormControlLabel control={
                <Switch checked={formValues.active}
                        onChange={event => setFormValue("active", event.target.checked)}
                />
            }
                              label={l("chat.invite.active")}
            />
            <TextField label={l("chat.invite.name")}
                       value={formValues.name}
                       error={Boolean(formErrors.name)}
                       helperText={formErrors.name && l(formErrors.name)}
                       onChange={event => setFormValue("name", event.target.value)}
                       variant="outlined"
                       fullWidth
                       margin="dense"
            />
            {errorText && (
                <Typography color="red">
                    {errorText}
                </Typography>
            )}
        </Fragment>
    );
});
