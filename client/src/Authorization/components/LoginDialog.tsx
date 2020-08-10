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
    Typography
} from "@material-ui/core";
import withMobileDialog from "@material-ui/core/withMobileDialog";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import {useLocalization, useStore} from "../../store";

export const LoginDialog: FunctionComponent = withMobileDialog()(observer(({fullScreen}) => {
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
        }
    } = useStore();

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
                {error && (
                    <Typography variant="body1"
                                style={{color: "red"}}
                    >
                        {l(error.message, error.bindings)}
                    </Typography>
                )}
                <Button variant="contained"
                        color="primary"
                        style={{
                            width: "100%",
                            marginBottom: 10
                        }}
                        disabled={pending}
                        onClick={doLogin}
                >
                    {pending && <CircularProgress size={15}
                                                        color="primary"
                                                        style={{marginRight: 5}}
                    />}
                    {l("login")}
                </Button>
                <Button variant="outlined"
                        color="secondary"
                        style={{width: "100%"}}
                        onClick={() => setLoginDialogOpen(false)}
                >
                    {l("close")}
                </Button>
            </DialogContent>
        </Dialog>
    )
})) as FunctionComponent;
