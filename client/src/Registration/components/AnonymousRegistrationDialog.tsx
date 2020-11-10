import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    Button,
    CircularProgress,
    TextField,
    createStyles,
    makeStyles,
    Theme, Typography
} from "@material-ui/core";
import {useLocalization, useStore} from "../../store/hooks";
import {useMobileDialog} from "../../utils/hooks";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization/types";

const useStyles = makeStyles((theme: Theme) => createStyles({
    registerButton: {
        marginBottom: theme.spacing(2),
        width: "100%"
    },
    closeButton: {
        width: "100%"
    },
    errorTypography: {
        color: theme.palette.error.main
    }
}));

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("server.unreachable");
    } else {
        return l("error.unknown");
    }
};

export const AnonymousRegistrationDialog: FunctionComponent = observer(() => {
    const {
        anonymousRegistration: {
            anonymousRegistrationForm,
            anonymousRegistrationDialogOpen,
            formErrors,
            pending,
            error,
            setFormValue,
            setAnonymousRegistrationDialogOpen,
            registerAnonymousUser
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();
    const classes = useStyles();

    return (
        <Dialog open={anonymousRegistrationDialogOpen}
                onClose={() => setAnonymousRegistrationDialogOpen(false)}
                fullScreen={fullScreen}
                fullWidth
                maxWidth="md"
        >
            <DialogTitle>
                {l("login.as-anonymous")}
            </DialogTitle>
            <DialogContent>
                <TextField label={l("firstName")}
                           onChange={event => setFormValue("firstName", event.target.value)}
                           value={anonymousRegistrationForm.firstName}
                           error={Boolean(formErrors.firstName)}
                           helperText={formErrors.firstName && l(formErrors.firstName)}
                           fullWidth
                           margin="dense"
                />
                <TextField label={l("lastName")}
                           onChange={event => setFormValue("lastName", event.target.value)}
                           value={anonymousRegistrationForm.lastName}
                           error={Boolean(formErrors.lastName)}
                           helperText={formErrors.lastName && l(formErrors.lastName)}
                           fullWidth
                           margin="dense"
                />
                {error && (
                    <Typography className={classes.errorTypography}>
                        {getErrorText(error, l)}
                    </Typography>
                )}
                <Button onClick={registerAnonymousUser}
                        className={classes.registerButton}
                        color="primary"
                        variant="contained"
                        disabled={pending}
                >
                    {pending && <CircularProgress size={15} color="primary"/>}
                    {l("login")}
                </Button>
                <Button onClick={() => setAnonymousRegistrationDialogOpen(false)}
                        className={classes.closeButton}
                        color="secondary"
                        variant="outlined"
                >
                    {l("close")}
                </Button>
            </DialogContent>
        </Dialog>
    )
})
