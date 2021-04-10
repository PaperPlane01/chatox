import React, {FunctionComponent} from "react";
import {Select, FormControl, InputLabel, MenuItem} from "@material-ui/core";
import {useLocalization} from "../../store/hooks";
import {ReportReason} from "../../api/types/response";
import {Labels} from "../../localization/types";

interface ReportReasonSelectProps {
    value: ReportReason,
    onSelect: (reportReason: ReportReason) => void
}

export const ReportReasonSelect: FunctionComponent<ReportReasonSelectProps> = ({
    value,
    onSelect
}) => {
    const {l} = useLocalization();

    return (
        <FormControl fullWidth>
            <InputLabel>{l("report.reason")}</InputLabel>
            <Select value={value}
                    onChange={event => onSelect(event.target.value as ReportReason)}
            >
                {Object.keys(ReportReason).map(key => (
                    <MenuItem key={ReportReason[key as keyof typeof ReportReason]}
                              value={ReportReason[key as keyof typeof ReportReason]}
                    >
                        {l(`report.reason.${ReportReason[key as keyof typeof ReportReason]}` as keyof Labels)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};
