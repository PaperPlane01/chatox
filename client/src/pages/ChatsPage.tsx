import React, {Fragment, FunctionComponent} from "react";
import {createStyles, Grid, Hidden, makeStyles, Typography} from "@material-ui/core";
import {HasRole} from "../Authorization";
import {AppBar} from "../AppBar";
import {ChatsOfCurrentUserList} from "../Chat";
import {useLocalization} from "../store/hooks";

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

export const ChatsPage: FunctionComponent = () => {
    const {l} = useLocalization();
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

export default ChatsPage;
