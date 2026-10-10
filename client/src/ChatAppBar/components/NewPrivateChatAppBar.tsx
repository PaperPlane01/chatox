import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {AppBar, Box, CardHeader, IconButton, Toolbar, Typography, useMediaQuery, useTheme} from "@mui/material";
import {ArrowBack} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {Link} from "mobx-router";
import {useLocalization, useRouter, useStore} from "../../store/hooks";
import {useEntityById} from "../../entities";
import {trimString} from "../../utils/string-utils";
import {getOnlineOrLastSeenLabel, getUserDisplayedName} from "../../User/utils/labels";
import {NavigationalDrawer, OpenDrawerButton} from "../../AppBar/components";
import {Routes} from "../../router";
import {UserAvatar} from "../../UserAvatar/components";

const useStyles = makeStyles()(() => ({
    cardHeaderRoot: {
        padding: 0
    },
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const NewPrivateChatAppBar: FunctionComponent = observer(() => {
    const {
        messageCreation: {
            userId
        }
    } = useStore();
    const routerStore = useRouter();
    const {l, dateFnsLocale} = useLocalization();
    const {classes} = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));
    const user = useEntityById("users", userId);

    let appBarContent: ReactNode;

    if (!user) {
        appBarContent = <div/>
    } else {
        appBarContent = (
            <CardHeader title={(
                <div style={{display: "flex"}}>
                    <Typography variant="body1"
                                style={{cursor: "pointer"}}
                    >
                        {onSmallScreen ? trimString(getUserDisplayedName(user), 25) : getUserDisplayedName(user)}
                    </Typography>
                </div>
            )}
                        subheader={getOnlineOrLastSeenLabel(
                            user,
                            dateFnsLocale,
                            l,
                            {
                                variant: "body2",
                                style: {
                                    opacity: user.online ? 1 : 0.5,
                                    cursor: "pointer"
                                }
                            }
                        )}
                        avatar={(
                            <div>
                                <UserAvatar user={user}/>
                            </div>
                        )}
                        style={{
                            width: "100%"
                        }}
                        classes={{
                            root: classes.cardHeaderRoot
                        }}
            />
        );
    }

    return (
        <Fragment>
            <AppBar position="fixed">
                <Toolbar>
                    <Box sx={{
                        display: {
                            lg: "none",
                            xs: "block"
                        }
                    }}>
                        <OpenDrawerButton/>
                    </Box>
                    <Box sx={{
                        display: {
                            xs: "none",
                            lg: "block",
                        }
                    }}>
                        <Link route={Routes.myChats}
                              router={routerStore}
                              className={classes.undecoratedLink}
                        >
                            <IconButton color="inherit"
                                        size="medium"
                            >
                                <ArrowBack/>
                            </IconButton>
                        </Link>
                    </Box>
                    {appBarContent}
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <NavigationalDrawer/>
        </Fragment>
    );
});
