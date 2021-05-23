import React, {FunctionComponent, useEffect, Fragment} from "react";
import {observer} from "mobx-react";
import {Typography, Grid, CircularProgress} from "@material-ui/core";
import {AppBar} from "../AppBar";
import {useAuthorization, useLocalization, useRouter, useStore} from "../store";
import {getRouteByPath} from "../router";
import {API_UNREACHABLE_STATUS} from "../api";

export const GoogleAuthenticationPage: FunctionComponent = observer(() => {
    const {
        googleLogin: {
            pending,
            error,
            getOriginalParams,
            getOriginalPath,
            getOriginalQueryParams
        }
    } = useStore();
    const router = useRouter();
    const {currentUser} = useAuthorization();
    const {l} = useLocalization();
    const path = getOriginalPath();

    useEffect(() => {
        if (currentUser && path) {
            router.router.goTo(getRouteByPath(path), getOriginalParams(), getOriginalQueryParams());
        }
    });

    return (
        <Grid container>
            <Grid item xs={12}>
                <AppBar/>
            </Grid>
            <Grid item xs={12}>
                {pending && (
                    <Fragment>
                        <CircularProgress color="primary" size={20}/>
                        <Typography>
                            {l("login.google.pending")}
                        </Typography>
                    </Fragment>
                )}
                {error && (
                    <Fragment>
                        <Typography style={{color: "red"}}>
                            {error.status === API_UNREACHABLE_STATUS
                                ? l("server.unreachable")
                                : l("login.google.error", {errorStatus: error.status})
                            }
                        </Typography>
                    </Fragment>
                )}
            </Grid>
        </Grid>
    );
});

export default GoogleAuthenticationPage;
