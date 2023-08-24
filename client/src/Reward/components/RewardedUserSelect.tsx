import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {TextField, Button, CircularProgress, Chip, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {SelectUserForRewardFormData} from "../types";
import {useLocalization} from "../../store";
import {FormErrors} from "../../utils/types";
import {ApiError} from "../../api";
import {UserEntity} from "../../User";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {Avatar} from "../../Avatar";

interface RewardedUserSelectProps {
    selectedUser?: UserEntity,
    formValues: SelectUserForRewardFormData,
    formErrors: FormErrors<SelectUserForRewardFormData>,
    pending: boolean,
    error?: ApiError,
    setFormValue: <K extends keyof SelectUserForRewardFormData>(key: K, value: SelectUserForRewardFormData[K]) => void,
    submitForm: () => void,
    onClear: () => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    userIdContainer: {
        display: "flex",
        gap: theme.spacing(2)
    }
}));

export const RewardedUserSelect: FunctionComponent<RewardedUserSelectProps> = observer(({
    selectedUser,
    formValues,
    formErrors,
    pending,
    setFormValue,
    submitForm,
    onClear
}) => {
   const {l} = useLocalization();
   const classes = useStyles();

   return (
       <Fragment>
           {selectedUser
               ? (
                   <Chip avatar={
                       <Avatar avatarColor={randomColor({seed: selectedUser.id})}
                               avatarLetter={getUserAvatarLabel(selectedUser)}
                               width={20}
                               height={20}
                               avatarId={selectedUser.avatarId}
                               avatarUri={selectedUser.externalAvatarUri}
                       />
                   }
                         label={getUserDisplayedName(selectedUser)}
                         onDelete={onClear}
                   />
               )
               : (
                   <div className={classes.userIdContainer}>
                       <TextField label={l("reward.user")}
                                  placeholder={l("reward.user.id")}
                                  value={formValues.userIdOrSlug}
                                  onChange={event => setFormValue("userIdOrSlug", event.target.value)}
                                  error={Boolean(formErrors.userIdOrSlug)}
                                  helperText={formErrors.userIdOrSlug && l(formErrors.userIdOrSlug)}
                       />
                       <Button variant="contained"
                               color="primary"
                               onClick={submitForm}
                               disabled={pending}
                       >
                           {pending && <CircularProgress color="primary" size={15}/>}
                           {l("reward.user.find")}
                       </Button>
                   </div>
               )
           }
       </Fragment>
   );
});