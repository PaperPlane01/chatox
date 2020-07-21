import React, {FunctionComponent, Fragment} from "react";
import {inject, observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Typography
} from "@material-ui/core";
import withMobileDialog, {WithMobileDialog} from "@material-ui/core/withMobileDialog";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import {RegisterUserFormData} from "../types";
import {FormErrors} from "../../utils/types";
import {IAppState} from "../../store";
import {ApiError} from "../../api";
import {RegistrationResponse} from "../../api/types/response";
import {localized, Localized} from "../../localization";

interface RegistrationDialogMobxProps {
    registrationDialogOpen: boolean,
    registerUserForm: RegisterUserFormData,
    errors: FormErrors<RegisterUserFormData>,
    checkingUsernameAvailability: boolean,
    checkingSlugAvailability: boolean,
    pending: boolean,
    registrationResponse?: RegistrationResponse,
    registrationError?: ApiError,
    displayPassword: boolean,
    setFormValue: <Key extends keyof RegisterUserFormData>(key: Key, value: RegisterUserFormData[Key]) => void,
    setRegistrationDialogOpen: (registrationDialogOpen: boolean) => void,
    registerUser: () => void,
    setDisplayPassword: (displayPassword: boolean) => void
}

type RegistrationDialogProps = RegistrationDialogMobxProps & Localized & WithMobileDialog;

const _RegistrationDialog: FunctionComponent<RegistrationDialogProps> = ({
    checkingSlugAvailability,
    checkingUsernameAvailability,
    registerUserForm,
    errors,
    registrationError,
    pending,
    displayPassword,
    registerUser,
    setFormValue,
    setRegistrationDialogOpen,
    setDisplayPassword,
    l
}) => {
    return (
        <Fragment>
            <DialogTitle>
                {l("register")}
            </DialogTitle>
            <DialogContent>
                <TextField label={l("username")}
                           value={registerUserForm.username}
                           onChange={event => setFormValue("username", event.target.value as string)}
                           error={Boolean(errors.username)}
                           helperText={errors.username && l(errors.username)}
                           fullWidth
                           margin="dense"
                           InputProps={{
                               endAdornment: checkingUsernameAvailability
                                   ? (
                                       <InputAdornment position="end">
                                           <CircularProgress color="primary" size={20}/>
                                       </InputAdornment>
                                   )
                                   : null
                           }}
                />
                <TextField label={l("password")}
                           value={registerUserForm.password}
                           onChange={event => setFormValue("password", event.target.value as string)}
                           error={Boolean(errors.password)}
                           helperText={errors.password && l(errors.password)}
                           fullWidth
                           margin="dense"
                           type={displayPassword ? "text" : "password"}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <IconButton onClick={() => setDisplayPassword(!displayPassword)}>
                                           {displayPassword
                                               ? <VisibilityOffIcon/>
                                               : <VisibilityIcon/>
                                           }
                                       </IconButton>
                                   </InputAdornment>
                               )
                           }}
                />
                <TextField label={l("repeatedPassword")}
                           value={registerUserForm.repeatedPassword}
                           onChange={event => setFormValue("repeatedPassword", event.target.value as string)}
                           error={Boolean(errors.repeatedPassword)}
                           helperText={errors.repeatedPassword && l(errors.repeatedPassword)}
                           fullWidth
                           margin="dense"
                           type={displayPassword ? "text" : "password"}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <IconButton onClick={() => setDisplayPassword(!displayPassword)}>
                                           {displayPassword
                                               ? <VisibilityOffIcon/>
                                               : <VisibilityIcon/>
                                           }
                                       </IconButton>
                                   </InputAdornment>
                               )
                           }}
                />
                <TextField label={l("firstName")}
                           value={registerUserForm.firstName}
                           onChange={event => setFormValue("firstName", event.target.value as string)}
                           error={Boolean(errors.firstName)}
                           helperText={errors.firstName && l(errors.firstName)}
                           fullWidth
                           margin="dense"
                />
                <TextField label={l("lastName")}
                           value={registerUserForm.lastName}
                           onChange={event => setFormValue("lastName", event.target.value as string)}
                           error={Boolean(errors.lastName)}
                           helperText={errors.lastName && l(errors.lastName)}
                           fullWidth
                           margin="dense"
                />
                <TextField label={l("slug")}
                           value={registerUserForm.slug}
                           onChange={event => setFormValue("slug", event.target.value as string)}
                           error={Boolean(errors.slug)}
                           helperText={errors.slug && l(errors.slug)}
                           fullWidth
                           margin="dense"
                           InputProps={{
                               endAdornment: checkingSlugAvailability
                                   ? (
                                       <InputAdornment position="end">
                                           <CircularProgress color="primary" size={20}/>
                                       </InputAdornment>
                                   )
                                   : null
                           }}
                />
                {registrationError && (
                    <Typography variant="body1"
                                style={{color: "red"}}
                    >
                        {l(registrationError.message, registrationError.bindings)}
                    </Typography>
                )}
                <Button variant="contained"
                        color="primary"
                        disabled={pending || checkingUsernameAvailability || checkingSlugAvailability}
                        onClick={registerUser}
                        style={{
                            width: "100%",
                            marginBottom: 10
                        }}
                >
                    {pending && <CircularProgress size={15}
                                                  color="primary"
                                                  style={{marginRight: 5}}
                    />}
                    {l("register")}
                </Button>
                <Button variant="outlined"
                        color="secondary"
                        onClick={() => setRegistrationDialogOpen(false)}
                        style={{
                            width: "100%"
                        }}
                >
                    {l("close")}
                </Button>
            </DialogContent>
        </Fragment>
    )
};

const mapMobxToProps = (state: IAppState): RegistrationDialogMobxProps => ({
    checkingSlugAvailability: state.userRegistration.checkingSlugAvailability,
    checkingUsernameAvailability: state.userRegistration.checkingUsernameAvailability,
    errors: state.userRegistration.registrationFormErrors,
    registerUserForm: state.userRegistration.registrationForm,
    registrationDialogOpen: state.userRegistration.registrationDialogOpen,
    setFormValue: state.userRegistration.updateFormValue,
    pending: state.userRegistration.pending,
    displayPassword: state.userRegistration.displayPassword,
    setRegistrationDialogOpen: state.registrationDialog.setRegistrationDialogOpen,
    registerUser: state.userRegistration.registerUser,
    registrationResponse: state.userRegistration.registrationResponse,
    registrationError: state.userRegistration.submissionError,
    setDisplayPassword: state.userRegistration.setDisplayPassword
});

export const RegisterStep = withMobileDialog()(
    localized(inject(mapMobxToProps)(observer(_RegistrationDialog))) as FunctionComponent
);
