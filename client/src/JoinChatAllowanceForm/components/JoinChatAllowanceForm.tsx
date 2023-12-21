import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControl, InputLabel, MenuItem, Select, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import clsx from "clsx";
import {useLocalization} from "../../store";
import {
    JOIN_CHAT_ALLOWANCES,
    JoinAllowanceMap,
    JoinChatAllowance,
    USER_VERIFICATION_LEVELS,
    UserVerificationLevel
} from "../../api/types/response";
import {Labels} from "../../localization";
import {createBorderedStyle} from "../../style";

interface JoinChatAllowanceFormProps {
    formValues: JoinAllowanceMap,
    wrapWithBorder?: boolean,
    label?: keyof Labels,
    setValue: (userVerificationLevel: UserVerificationLevel, allowance: JoinChatAllowance) => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    joinChatAllowanceFormWrapper: {
        width: "100%",
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2)
    },
    joinChatAllowanceFormField: {
        padding: theme.spacing(2)
    },
    bordered: createBorderedStyle(theme, `-${theme.spacing(1)}`),
    header: {
        paddingLeft: theme.spacing(2)
    }
}));

export const JoinChatAllowanceForm: FunctionComponent<JoinChatAllowanceFormProps> = observer(({
    formValues,
    setValue,
    wrapWithBorder = false,
    label
}) => {
   const {l} = useLocalization();
   const classes = useStyles();
   const className = clsx({
       [classes.joinChatAllowanceFormWrapper]: true,
       [classes.bordered]: wrapWithBorder
   });

   return (
       <div className={className}>
           {label && (
               <Typography variant="h6"
                           className={classes.header}
               >
                   {l(label)}
               </Typography>
           )}
           {USER_VERIFICATION_LEVELS.map(verificationLevel => (
               <FormControl fullWidth className={classes.joinChatAllowanceFormField}>
                   <InputLabel id={`verificationLevelLabel_${verificationLevel}`}>
                       {l(`user.verification.level.${verificationLevel}` as keyof Labels)}
                   </InputLabel>
                   <Select id={`joinChatAllowanceSelect_${verificationLevel}`}
                           labelId={`verificationLevelLabel_${verificationLevel}`}
                           value={formValues[verificationLevel] || JoinChatAllowance.ALLOWED}
                           onChange={event => setValue(verificationLevel, event.target.value as JoinChatAllowance)}
                   >
                       {JOIN_CHAT_ALLOWANCES.map(allowance => (
                           <MenuItem value={allowance}>
                               {l(`join.chat.allowance.${allowance}` as keyof Labels)}
                           </MenuItem>
                       ))}
                   </Select>
               </FormControl>
           ))}
       </div>
   );
});
