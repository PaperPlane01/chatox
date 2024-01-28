import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {TextField, Button, CircularProgress, Chip, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {SelectUserFormData} from "../types";
import {useLocalization} from "../../store";
import {FormErrors} from "../../utils/types";
import {ApiError} from "../../api";
import {UserEntity} from "../../User";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {Avatar} from "../../Avatar";

interface UserSelectProps {
    selectedUser?: UserEntity,
    formValues: SelectUserFormData,
    formErrors: FormErrors<SelectUserFormData>,
    pending: boolean,
    error?: ApiError,
    setFormValue: <K extends keyof SelectUserFormData>(key: K, value: SelectUserFormData[K]) => void,
    submitForm: () => void,
    onClear: () => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    userIdContainer: {
        display: "flex",
        gap: theme.spacing(2)
    }
}));

export const UserSelect: FunctionComponent<UserSelectProps> = observer(({
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
                       <TextField label={l("user.select.user")}
                                  placeholder={l("user.select.id")}
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
                           {l("user.select.find")}
                       </Button>
                   </div>
               )
           }
       </Fragment>
   );
});