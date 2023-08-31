import React, {FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Balance} from "./Balance";
import {useLocalization, useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
    balanceList: {
        paddingTop: theme.spacing(2),
        paddingLeft: theme.spacing(2),
        paddingBottom: theme.spacing(2),
        display: "flex",
        flexDirection: "column"
    }
}));

export const BalanceList: FunctionComponent = observer(() => {
    const {
        balance: {
            balances
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    const balanceList: ReactNode[] = [];

    for (const [currency, amount] of balances.entries()) {
        balanceList.push(
            <Balance currency={currency} amount={amount}/>
        );
    }

    return (
        <div className={classes.balanceList}>
            <Typography>
                {l("balance.your-balance")}
            </Typography>
            {balanceList}
        </div>
    );
});
