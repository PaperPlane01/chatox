import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControl, FormHelperText, IconButton, MenuItem, OutlinedInput, Select, InputLabel} from "@mui/material";
import {Close} from "@mui/icons-material";
import {useLocalization} from "../../store";
import {TimeUnit} from "../../api/types/response";
import {Labels} from "../../localization";

interface RecurringPeriodTimeUnitSelectProps {
    value?: TimeUnit,
    error?: boolean,
    errorText?: string,
    onSelect: (timeUnit: TimeUnit) => void,
    onClear: () => void
}

export const RecurringPeriodTimeUnitSelect: FunctionComponent<RecurringPeriodTimeUnitSelectProps> = observer(({
    value,
    error = false,
    errorText,
    onSelect,
    onClear
}) => {
    const {l} = useLocalization();

    return (
        <FormControl fullWidth>
            <InputLabel id="timeUnitSelectLabel">
                {l("reward.recurring-period.unit")}
            </InputLabel>
            <Select labelId="timeUnitSelectLabel"
                    value={value}
                    onChange={event => onSelect(event.target.value as TimeUnit)}
                    input={(
                        <OutlinedInput label={l("reward.recurring-period.unit")}
                                       endAdornment={(
                                           <IconButton onClick={onClear}>
                                               <Close/>
                                           </IconButton>
                                       )}
                                       error={error}
                        />
                    )}
                    renderValue={() => value
                        ? l(`reward.recurring-period.unit.${value}` as keyof Labels)
                        : ""
                    }
            >
                {Object.keys(TimeUnit).map(timeUnit => (
                    <MenuItem key={timeUnit}
                              value={timeUnit}
                    >
                        {l(`reward.recurring-period.unit.${timeUnit}` as keyof Labels)}
                    </MenuItem>
                ))}
            </Select>
            {errorText && <FormHelperText>{errorText}</FormHelperText>}
        </FormControl>
    );
});
