import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {stringify} from "query-string";
import {useLocalization, useRouter, useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
    loginWithGoogleButton: {
        color: "white",
        backgroundColor: "#cb3837",
        width: "100%",
        "&:hover": {
            backgroundColor: "#9c2828"
        },
        marginTop: theme.spacing(2)
    }
}));

export const LoginWithGoogleButton: FunctionComponent = observer(() => {
    const {
        googleLogin: {
            setOriginalParams,
            setOriginalPath,
            setOriginalQueryParams
        }
    } = useStore();
    const {l} = useLocalization();
    const router = useRouter();
    const classes = useStyles();

    const handleClick = (): void => {
        const currentPath = router.currentRoute?.path;
        const currentParams = router.params;
        const queryParams = router.queryParams;

        setOriginalPath(currentPath ? currentPath : "");
        currentParams && setOriginalParams(currentParams);
        queryParams && setOriginalQueryParams(queryParams);

        const client_id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        const scope = import.meta.env.VITE_GOOGLE_CLIENT_SCOPE;
        const redirect_uri = import.meta.env.VITE_GOOGLE_CLIENT_REDIRECT_URI;

        const queryString = stringify({client_id, scope, redirect_uri, response_type: "token"});

        window.location.href = `https://accounts.google.com/o/oauth2/auth?${queryString}`;
    }

    return (
        <Button onClick={handleClick}
                variant="contained"
                className={classes.loginWithGoogleButton}
        >
            {l("login.google")}
        </Button>
    );
});
