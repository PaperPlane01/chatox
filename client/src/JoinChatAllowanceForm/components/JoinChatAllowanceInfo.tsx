import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import clsx from "clsx";
import {useLocalization} from "../../store";
import {JoinAllowanceMap} from "../../api/types/response";
import {createBorderedStyle} from "../../style";
import {Labels} from "../../localization";

interface JoinChatAllowanceInfoProps {
    allowances: JoinAllowanceMap,
    label?: keyof Labels,
    wrapWithBorder?: boolean
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    bordered: createBorderedStyle(theme),
    joinChatAllowanceInfo: {
        display: "flex",
        flexDirection: "column"
    }
}));

export const JoinChatAllowanceInfo: FunctionComponent<JoinChatAllowanceInfoProps> = observer(({
    allowances,
    wrapWithBorder = false,
    label
}) => {
    const {l} = useLocalization();
    const classes = useStyles();
    const className = clsx(({
        [classes.joinChatAllowanceInfo]: true,
        [classes.bordered]: wrapWithBorder
    }));

    return (
        <div className={className}>
            {label && (
                <Typography variant="h6">
                    {l(label)}
                </Typography>
            )}
            {Object.keys(allowances).map(verificationLevel => (
                <Fragment>
                    <Typography variant="h6">
                        {l(`user.verification.level.${verificationLevel}` as keyof Labels)}
                    </Typography>
                    <Typography>
                        {l(`join.chat.allowance.${allowances[verificationLevel as keyof JoinAllowanceMap]}` as keyof Labels)}
                    </Typography>
                </Fragment>
            ))}
        </div>
    );
});
