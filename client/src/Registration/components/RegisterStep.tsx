import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Typography,
} from "@material-ui/core";
import {Visibility, VisibilityOff} from "@material-ui/icons";
import {useLocalization, useStore} from "../../store";

export const RegisterStep: FunctionComponent = observer(() => {
    const {
        userRegistration: {
            checkingSlugAvailability,
            checkingUsernameAvailability,
            registrationForm: registerUserForm,
            registrationFormErrors: errors,
            submissionError: registrationError,
            pending,
            displayPassword,
            registerUser,
            updateFormValue: setFormValue,
            setDisplayPassword
        },
        registrationDialog: {
            setRegistrationDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

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
                                               ? <VisibilityOff/>
                                               : <Visibility/>
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
                                               ? <VisibilityOff/>
                                               : <Visibility/>
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
});
