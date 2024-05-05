import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {AppBar, CardHeader, Hidden, IconButton, Toolbar, Typography, useMediaQuery, useTheme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {ArrowBack} from "@mui/icons-material";
import randomColor from "randomcolor";
import {Link} from "mobx-router";
import {useLocalization, useRouter, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {trimString} from "../../utils/string-utils";
import {getOnlineOrLastSeenLabel, getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {Avatar} from "../../Avatar";
import {NavigationalDrawer, OpenDrawerButton} from "../../AppBar";
import {Routes} from "../../router";

const useStyles = makeStyles(() => createStyles({
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
    const classes = useStyles();
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
                                <Avatar avatarLetter={getUserAvatarLabel(user)}
                                        avatarColor={randomColor({seed: user.id})}
                                        avatarUri={user.externalAvatarUri}
                                        avatarId={user.avatarId}
                                />
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
                    <Hidden xlDown>
                        <OpenDrawerButton/>
                    </Hidden>
                    <Hidden lgUp>
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
                    </Hidden>
                    {appBarContent}
                </Toolbar>
            </AppBar>
            <Toolbar/>
            <NavigationalDrawer/>
        </Fragment>
    );
});
