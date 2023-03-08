import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid, Hidden, Typography, useMediaQuery, useTheme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {HasRole} from "../Authorization";
import {AppBar} from "../AppBar";
import {ChatsOfCurrentUserListWrapper} from "../Chat";
import {ChatsAndMessagesSearchInputWrapper} from "../ChatsAndMessagesSearch";
import {useLocalization, useStore} from "../store";

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

export const ChatsPage: FunctionComponent = observer(() => {
    const {
        chatsAndMessagesSearchQuery: {
            showInput
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down('xl'));

    const content = (
        <Grid container style={{overflow: "hidden"}}>
            <Grid item xs={12}>
                <AppBar hideTitle={showInput && onSmallScreen}
                        additionalLeftItem={<ChatsAndMessagesSearchInputWrapper/>}
                />
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
                    <ChatsOfCurrentUserListWrapper/>
                    <Hidden xlDown>
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
            <Hidden xlDown>
                <ScrollLock>
                    {content}
                </ScrollLock>
            </Hidden>
            <Hidden lgUp>
                {content}
            </Hidden>
        </Fragment>
    );
});

export default ChatsPage;
