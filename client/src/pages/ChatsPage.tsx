import React, {FunctionComponent, Fragment} from "react";
import {Grid, Hidden, Typography, createStyles, makeStyles} from "@material-ui/core";
import {HasRole} from "../Authorization";
import {AppBar} from "../AppBar";
import {ChatsOfCurrentUserList} from "../Chat";
import {localized, Localized} from "../localization";

const ScrollLock = require("react-scrolllock").default;

const useStyles = makeStyles(() => createStyles({
    centered: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        width: "100%"
    }
}));

const _ChatsPage: FunctionComponent<Localized> = ({l}) => {
    const classes = useStyles();

    const content = (
        <Grid container style={{overflow: "hidden"}}>
            <Grid item xs={12}>
                <AppBar/>
            </Grid>
            <HasRole role="ROLE_ACCESS_TOKEN_PRESENT"
                     alternative={(
                         <div className={classes.centered}>
                             <Typography>
                                 {l("chat.login-to-see-list")}
                             </Typography>
                         </div>
                     )}
            >
                <Grid item xs={12} style={{display: "flex"}}>
                    <ChatsOfCurrentUserList/>
                    <Hidden mdDown>
                        <div className={classes.centered}>
                            <Typography variant="body1"
                                        color="textSecondary"
                            >
                                {l("chat.select-chat")}
                            </Typography>
                        </div>
                    </Hidden>
                </Grid>
            </HasRole>
        </Grid>
    );

    return (
        <Fragment>
            <Hidden mdDown>
                <ScrollLock>
                    {content}
                </ScrollLock>
            </Hidden>
            <Hidden lgUp>
                {content}
            </Hidden>
        </Fragment>
    )
};

export const ChatsPage = localized(_ChatsPage) as FunctionComponent;
