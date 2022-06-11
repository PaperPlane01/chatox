import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Button,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    Theme,
    Typography,
} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";
import {PasswordRecoveryStep} from "../../PasswordRecovery/types";
import {LoginWithGoogleButton} from "./LoginWithGoogleButton";

const useStyles = makeStyles((theme: Theme) => createStyles({
    dialogActionButton: {
        marginTop: theme.spacing(2),
        width: "100%"
    },
    forgotYourPasswordTypography: {
        float: "right",
        cursor: "pointer",
        color: theme.palette.text.secondary,
        "&:hover": {
            color: theme.palette.text.primary
        }
    },
    loginAsAnonymousButton: {
        textTransform: "none",
        width: "100%"
    }
}));

export const LoginDialog: FunctionComponent = observer(() => {
    const {l} = useLocalization();
    const {
        login: {
            loginDialogOpen,
            loginForm,
            loginFormErrors,
            displayPassword,
            error,
            pending,
            updateLoginFormValue,
            setDisplayPassword,
            setLoginDialogOpen,
            doLogin
        },
        passwordRecoveryDialog: {
            setPasswordRecoveryDialogOpen,
            setCurrentStep
        },
        anonymousRegistration: {
            setAnonymousRegistrationDialogOpen
        }
    } = useStore();
    const {fullScreen} = useMobileDialog();
    const classes = useStyles();

    const handlePasswordRecoveryClick = (): void => {
        setLoginDialogOpen(false);
        setCurrentStep(PasswordRecoveryStep.CREATE_EMAIL_CONFIRMATION_CODE);
        setPasswordRecoveryDialogOpen(true);
    };

    return (
        <Dialog open={loginDialogOpen}
                fullScreen={fullScreen}
                onClose={() => setLoginDialogOpen(false)}
        >
            <DialogTitle>
                {l("login")}
            </DialogTitle>
            <DialogContent>
                <TextField label={l("username")}
                           value={loginForm.username}
                           onChange={event => updateLoginFormValue("username", event.target.value as string)}
                           error={Boolean(loginFormErrors.username)}
                           helperText={loginFormErrors.username && l(loginFormErrors.username)}
                           fullWidth
                           margin="dense"
                />
                <TextField label={l("password")}
                           value={loginForm.password}
                           onChange={event => updateLoginFormValue("password", event.target.value as string)}
                           error={Boolean(loginFormErrors.password)}
                           helperText={loginFormErrors.password && l(loginFormErrors.password)}
                           fullWidth
                           margin="dense"
                           type={displayPassword ? "text" : "password"}
                           InputProps={{
                               endAdornment: (
                                   <InputAdornment position="end">
                                       <IconButton onClick={() => setDisplayPassword(!displayPassword)} size="large">
                                           {displayPassword
                                               ? <VisibilityOff/>
                                               : <Visibility/>
                                           }
                                       </IconButton>
                                   </InputAdornment>
                               )
                           }}
                />
                <Typography className={classes.forgotYourPasswordTypography}
                            onClick={handlePasswordRecoveryClick}
                >
                    {l("password-recovery.forgot-your-password")}
                </Typography>
                {error && (
                    <Typography variant="body1"
                                style={{color: "red"}}
                    >
                        {l(error.message, error.bindings)}
                    </Typography>
                )}
                <Button variant="contained"
                        color="primary"
                        className={classes.dialogActionButton}
                        disabled={pending}
                        onClick={doLogin}
                >
                    {pending && <CircularProgress size={15}
                                                  color="primary"
                                                  style={{marginRight: 5}}
                    />}
                    {l("login")}
                </Button>
                <LoginWithGoogleButton/>
                <Button variant="text"
                        className={classes.loginAsAnonymousButton}
                        onClick={() => {
                            setLoginDialogOpen(false);
                            setAnonymousRegistrationDialogOpen(true)
                        }}
                >
                    {l("login.as-anonymous")}
                </Button>
                <Button variant="outlined"
                        color="secondary"
                        className={classes.dialogActionButton}
                        onClick={() => setLoginDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogContent>
        </Dialog>
    );
});
