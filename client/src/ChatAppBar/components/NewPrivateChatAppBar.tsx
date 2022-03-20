import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {
    AppBar,
    CardHeader,
    createStyles,
    Hidden,
    IconButton,
    makeStyles,
    Toolbar,
    Typography, useMediaQuery,
    useTheme
} from "@material-ui/core";
import {ArrowBack} from "@material-ui/icons";
import randomColor from "randomcolor";
import {useStore, useLocalization, useRouter} from "../../store";
import {trimString} from "../../utils/string-utils";
import {getOnlineOrLastSeenLabel, getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {Avatar} from "../../Avatar";
import {NavigationalDrawer, OpenDrawerButton} from "../../AppBar";
import {Routes} from "../../router";

const {Link} = require("mobx-router")

const useStyles = makeStyles(() => createStyles({
    cardHeaderRoot: {
        padding: 0
    }
}));

export const NewPrivateChatAppBar: FunctionComponent = observer(() => {
    const {
        messageCreation: {
            userId
        },
        entities: {
            users: {
                findById: findUser
            }
        }
    } = useStore();
    const routerStore = useRouter();
    const {l, dateFnsLocale} = useLocalization();
    const classes = useStyles();
    const theme = useTheme();
    const onSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

    let appBarContent: ReactNode;

    if (!userId) {
        appBarContent = <div/>
    } else {
        const user = findUser(userId);

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
        )
    }

    return (
        <Fragment>
            <AppBar position="fixed">
                <Toolbar>
                    <Hidden mdDown>
                        <OpenDrawerButton/>
                    </Hidden>
                    <Hidden lgUp>
                        <Link view={Routes.myChats}
                              store={routerStore}
                              style={{
                                  textDecoration: "none",
                                  color: "inherit"
                              }}
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
