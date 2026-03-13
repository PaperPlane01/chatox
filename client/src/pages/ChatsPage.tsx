import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Grid, Typography, useMediaQuery, useTheme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import ScrollLock from "react-scrolllock";
import {commonStyles} from "../style";
import {HasRole} from "../Authorization";
import {AppBar} from "../AppBar";
import {ChatsOfCurrentUserListWrapper} from "../Chat";
import {ChatsAndMessagesSearchInputWrapper} from "../ChatsAndMessagesSearch";
import {useLocalization, useStore} from "../store";

const useStyles = makeStyles()(() => ({
    centered: {
        ...commonStyles.centered,
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
    const { classes } = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

    const content = (
        <Grid container style={{overflow: "hidden"}}>
            <Grid size={12}>
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
                <Grid size={12} style={{display: "flex"}}>
                    <ChatsOfCurrentUserListWrapper/>
                    {!onSmallScreen && (
                        <div className={classes.centered}>
                            <Typography variant="body1"
                                        color="textSecondary"
                            >
                                {l("chat.select-chat")}
                            </Typography>
                        </div>
                    )}
                </Grid>
            </HasRole>
        </Grid>
    );

    return (
        <Fragment>
            {!onSmallScreen && (
                <ScrollLock>
                    {content}
                </ScrollLock>
            )}
            {onSmallScreen && content}
        </Fragment>
    );
});

export default ChatsPage;
