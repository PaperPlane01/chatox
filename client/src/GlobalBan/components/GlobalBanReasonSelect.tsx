import React, {FunctionComponent} from "react";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useLocalization} from "../../store";
import {GlobalBanReason} from "../../api/types/response";
import {Labels} from "../../localization";

interface GlobalBanReasonSelectProps {
    onSelect: (globalBanReason: GlobalBanReason) => void,
    value: GlobalBanReason
}

export const GlobalBanReasonSelect: FunctionComponent<GlobalBanReasonSelectProps> = ({
    onSelect,
    value
}) => {
    const {l} = useLocalization();

    return (
        <FormControl fullWidth>
            <InputLabel>{l("global.ban.reason")}</InputLabel>
            <Select value={value}
                    onChange={event => onSelect(event.target.value as GlobalBanReason)}
            >
                {Object.keys(GlobalBanReason).map(key => (
                    <MenuItem key={GlobalBanReason[key as keyof typeof GlobalBanReason]}
                              value={GlobalBanReason[key as keyof typeof GlobalBanReason]}
                    >
                        {l(`global.ban.reason.${GlobalBanReason[key as keyof typeof GlobalBanReason]}` as keyof Labels)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    )
};
