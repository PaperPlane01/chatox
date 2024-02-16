import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {FormControlLabel, Switch, TextField} from "@mui/material";
import {DateTimePicker} from "@mui/x-date-pickers";
import {RecurringPeriodTimeUnitSelect} from "./RecurringPeriodTimeUnitSelect";
import {RewardFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {useLocalization} from "../../store";
import {MAX_RECURRING_PERIOD_VALUE, MAX_REWARD_VALUE} from "../validation";

interface RewardFormProps {
    formValues: RewardFormData,
    formErrors: FormErrors<RewardFormData>,
    rewardedUserSelect: ReactNode,
    setFormValue: <K extends keyof RewardFormData>(key: K, value: RewardFormData[K]) => void
}

const MAX_REWARD_VALUE_BINDINGS = {
    maxValue: MAX_REWARD_VALUE
};
const MAX_RECURRING_PERIOD_VALUE_BINDINGS = {
    maxValue: MAX_RECURRING_PERIOD_VALUE
};

export const RewardForm: FunctionComponent<RewardFormProps> = observer(({
    formValues,
    formErrors,
    setFormValue,
    rewardedUserSelect
}) => {
    const {l} = useLocalization();

    return (
        <Fragment>
            <TextField label={l("reward.name")}
                       value={formValues.name}
                       onChange={event => setFormValue("name", event.target.value)}
                       error={Boolean(formErrors.name)}
                       helperText={formErrors.name && l(formErrors.name)}
                       fullWidth
                       margin="dense"
            />
            <TextField label={l("reward.min-value")}
                       value={formValues.minRewardValue}
                       onChange={event => setFormValue("minRewardValue", event.target.value)}
                       error={Boolean(formErrors.minRewardValue)}
                       helperText={formErrors.minRewardValue
                           && l(
                               formErrors.minRewardValue,
                               formErrors.minRewardValue === "common.validation.error.value-too-large"
                                   ? MAX_REWARD_VALUE_BINDINGS
                                   : undefined
                           )}
                       fullWidth
                       margin="dense"
            />
            <TextField label={l("reward.max-value")}
                       value={formValues.maxRewardValue}
                       onChange={event => setFormValue("maxRewardValue", event.target.value)}
                       error={Boolean(formErrors.maxRewardValue)}
                       helperText={formErrors.maxRewardValue
                           && l(
                               formErrors.maxRewardValue,
                               formErrors.maxRewardValue === "common.validation.error.value-too-large"
                                   ? MAX_REWARD_VALUE_BINDINGS
                                   : undefined
                           )}
            />
            <TextField label={l("reward.recurring-period.value")}
                       value={formValues.recurringPeriodValue}
                       onChange={event => setFormValue("recurringPeriodValue", event.target.value)}
                       helperText={formErrors.recurringPeriodValue
                           && l(
                               formErrors.recurringPeriodValue,
                               formErrors.recurringPeriodValue === "common.validation.error.value-too-large"
                                   ? MAX_RECURRING_PERIOD_VALUE_BINDINGS
                                   : undefined
                           )}
                       fullWidth
                       margin="dense"
            />
            <RecurringPeriodTimeUnitSelect value={formValues.recurringPeriodUnit}
                                           onSelect={unit => setFormValue("recurringPeriodUnit", unit)}
                                           onClear={() => setFormValue("recurringPeriodUnit", undefined)}
            />
            <FormControlLabel control={
                <Switch checked={formValues.useIntegersOnly}
                        onChange={event => setFormValue("useIntegersOnly", event.target.checked)}
                />
            }
                              label={l("reward.use-integers-only")}
            />
            <FormControlLabel control={
                <Switch checked={formValues.active}
                        onChange={event => setFormValue("active", event.target.checked)}
                />
            }
                              label={l("reward.active")}
            />
            <DateTimePicker value={formValues.periodStart || null}
                            onChange={date => date
                                ? setFormValue("periodStart", date)
                                : setFormValue("periodStart", undefined)}
                            openTo="day"
                            inputFormat="dd-MM-yyyy HH:mm"
                            disablePast
                            ampm={false}
                            renderInput={props => (
                                <TextField {...props}
                                           label={l("reward.period.start")}
                                           fullWidth
                                           margin="dense"
                                           error={Boolean(formErrors.periodStart)}
                                           helperText={formErrors.periodStart && l(formErrors.periodStart)}
                                />
                            )}
            />
            <DateTimePicker value={formValues.periodEnd || null}
                            onChange={date => date
                                ? setFormValue("periodEnd", date)
                                : setFormValue("periodEnd", undefined)}
                            openTo="day"
                            inputFormat="dd-MM-yyyy HH:mm"
                            disablePast
                            ampm={false}
                            renderInput={props => (
                                <TextField {...props}
                                           label={l("reward.period.end")}
                                           fullWidth
                                           margin="dense"
                                           error={Boolean(formErrors.periodEnd)}
                                           helperText={formErrors.periodEnd && l(formErrors.periodEnd)}
                                />
                            )}
            />
            {rewardedUserSelect}
        </Fragment>
    );
});
