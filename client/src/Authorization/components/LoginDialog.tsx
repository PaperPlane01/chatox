import React, {FunctionComponent} from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Button,
    TextField,
    CircularProgress,
    Typography
} from "@material-ui/core";
import withMobileDialog, {WithMobileDialog} from "@material-ui/core/withMobileDialog";
import {LoginFormData} from "../types";
import {localized, Localized} from "../../localization";
import {IAppState} from "../../store";
import {ApiError} from "../../api";
import {FormErrors} from "../../utils/types";
import {inject, observer} from "mobx-react";

interface LoginDialogMobxProps {
    loginForm: LoginFormData,
    errors: FormErrors<LoginFormData>,
    pending: boolean,
    error?: ApiError,
    loginDialogOpen: boolean,
    setLoginFormValue: (key: keyof LoginFormData, value: string) => void,
    doLogin: () => void,
    setLoginDialogOpen: (loginDialogOpen: boolean) => void
}

type LoginDialogProps = LoginDialogMobxProps & Localized & WithMobileDialog;

const _LoginDialog: FunctionComponent<LoginDialogProps> = ({
    loginForm,
    error,
    pending,
    errors,
    loginDialogOpen,
    fullScreen,
    setLoginDialogOpen,
    setLoginFormValue,
    doLogin,
    l
}) => (
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
                       onChange={event => setLoginFormValue("username", event.target.value as string)}
                       error={Boolean(errors.username)}
                       helperText={errors.username && l(errors.username)}
                       fullWidth
                       margin="dense"
            />
            <TextField label={l("password")}
                       value={loginForm.password}
                       onChange={event => setLoginFormValue("password", event.target.value as string)}
                       error={Boolean(errors.password)}
                       helperText={errors.password && l(errors.password)}
                       fullWidth
                       margin="dense"
                       type="password"
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
                    style={{width: "100%"}}
                    disabled={pending}
                    onClick={doLogin}
            >
                {pending && <CircularProgress size={15} color="primary"/>}
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
);

const mapMobxToProps = (state: IAppState): LoginDialogMobxProps => ({
    loginForm: state.login.loginForm,
    errors: state.login.loginFormErrors,
    error: state.login.error,
    pending: state.login.pending,
    loginDialogOpen: state.login.loginDialogOpen,
    doLogin: state.login.doLogin,
    setLoginDialogOpen: state.login.setLoginDialogOpen,
    setLoginFormValue: state.login.updateLoginFormValue
});

export const LoginDialog = withMobileDialog()(
    inject(mapMobxToProps)(observer(localized(_LoginDialog) as FunctionComponent<{}>))
);
