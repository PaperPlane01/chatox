import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {useLocalization} from "../../store";
import {TimeUnit} from "../../api/types/response";
import {Labels} from "../../localization";
import {TimeUnitSelect} from "../../TimeUnitSelect";

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
        <TimeUnitSelect value={value}
                        error={error}
                        errorText={errorText}
                        onSelect={onSelect}
                        onClear={onClear}
                        label={l("reward.recurring-period.unit")}
                        itemRenderer={timeUnit => l(`reward.recurring-period.unit.${timeUnit}` as keyof Labels)}
        />
    );
});
