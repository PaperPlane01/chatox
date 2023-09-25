import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControl, FormHelperText, IconButton, InputLabel, MenuItem, OutlinedInput, Select} from "@mui/material";
import {Close} from "@mui/icons-material";
import {useLocalization} from "../../store";
import {TimeUnit} from "../../api/types/response";
import {Labels} from "../../localization";

interface RecurringPeriodTimeUnitSelectProps {
    value?: TimeUnit,
    error?: boolean,
    errorText?: string,
    onSelect: (timeUnit: TimeUnit) => void,
    onClear: () => void,
    allowedUnits?: TimeUnit[],
    label?: string,
    labelId?: string,
    itemRenderer?: (unit: TimeUnit) => string
}

const DEFAULT_ALLOWED_TIME_UNITS: TimeUnit[] = [
    TimeUnit.SECONDS,
    TimeUnit.MINUTES,
    TimeUnit.HOURS,
    TimeUnit.DAYS,
    TimeUnit.WEEKS,
    TimeUnit.MONTHS,
    TimeUnit.YEARS
];

export const TimeUnitSelect: FunctionComponent<RecurringPeriodTimeUnitSelectProps> = observer(({
    value,
    error = false,
    errorText,
    onSelect,
    onClear,
    allowedUnits = DEFAULT_ALLOWED_TIME_UNITS,
    label,
    labelId,
    itemRenderer
}) => {
    const {l} = useLocalization();
    const actualLabelId = labelId ? labelId : "timeUnitSelectLabel";
    const actualLabel = label ? label : l("common.time-unit");

    const renderValue = (value?: TimeUnit): string => {
        return !value
            ? ""
            : itemRenderer ? itemRenderer(value) : l(`common.time-unit.${value}` as keyof Labels)
    };

    return (
        <FormControl fullWidth>
            <InputLabel id={actualLabelId}>
                {actualLabel}
            </InputLabel>
            <Select labelId={actualLabelId}
                    value={value}
                    onChange={event => onSelect(event.target.value as TimeUnit)}
                    input={(
                        <OutlinedInput label={actualLabel}
                                       endAdornment={(
                                           <IconButton onClick={onClear}>
                                               <Close/>
                                           </IconButton>
                                       )}
                                       error={error}
                        />
                    )}
                    renderValue={() => renderValue(value)}
            >
                {allowedUnits.map(timeUnit => (
                    <MenuItem key={timeUnit}
                              value={timeUnit}
                    >
                        {renderValue(timeUnit)}
                    </MenuItem>
                ))}
            </Select>
            {errorText && <FormHelperText>{errorText}</FormHelperText>}
        </FormControl>
    );
});
