import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Typography, Tooltip} from "@mui/material";
import shortNumber from "short-number";
import {useLocalization} from "../../store";
import {Currency} from "../../api/types/response";
import {Labels} from "../../localization";

interface BalanceProps {
    currency: Currency,
    amount: number
}

export const Balance: FunctionComponent<BalanceProps> = observer(({
    amount,
    currency
}) => {
    const {l} = useLocalization();

    if (amount < 1000) {
        return (
            <Typography>
                <strong>{shortNumber(amount)}</strong> {l(`currency.${currency}.plural` as keyof Labels)}
            </Typography>
        );
    } else {
        return (
            <Tooltip title={amount}>
                <Typography>
                    <strong>{shortNumber(amount)}</strong> {l(`currency.${currency}.plural` as keyof Labels)}
                </Typography>
            </Tooltip>
        );
    }
});
