import React, {Fragment, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Box, Button, IconButton, Menu, Skeleton, Theme} from "@mui/material";
import {AccountCircle} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import randomColor from "randomcolor";
import {RegistrationDialog, RegistrationMenuItem} from "../../Registration";
import {LoginDialog, LoginMenuItem, LogOutMenuItem} from "../../Authorization";
import {PasswordRecoveryDialog} from "../../PasswordRecovery";
import {Avatar} from "../../Avatar";
import {useAuthorization} from "../../store";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";

const useStyles = makeStyles()((theme: Theme) => ({
    userButton: {
        textTransform: "none"
    },
    userAvatarContainer: {
        [theme.breakpoints.up("md")]: {
            paddingRight: theme.spacing(2)
        }
    }
}));

export const UserAppBarMenu: FunctionComponent = observer(() => {
    const [anchorElement, setAnchorElement] = useState<Element | null>(null);
    const {currentUser, fetchingCurrentUser} = useAuthorization();
    const {classes} = useStyles();

    if (fetchingCurrentUser) {
        return (
            <Fragment>
                <Skeleton variant="circular"
                          height={40}
                          width={40}
                          className={classes.userAvatarContainer}
                />
                <Skeleton variant="text" height={20} width={50}/>
            </Fragment>
        );
    } else if (currentUser) {
        const avatarLetter = getUserAvatarLabel(currentUser);

        return (
            <Fragment>
                <Button onClick={event => setAnchorElement(event.currentTarget)}
                        color="inherit"
                        className={classes.userButton}
                >
                    <div className={classes.userAvatarContainer}>
                        <Avatar avatarLetter={avatarLetter}
                                avatarColor={randomColor({seed: currentUser.id})}
                                avatarId={currentUser.avatarId}
                                avatarUri={currentUser.externalAvatarUri}
                        />
                    </div>
                    <Box display={{
                        xs: "none",
                        lg: "block",
                    }}>
                        {getUserDisplayedName(currentUser)}
                    </Box>
                </Button>
                <Menu open={Boolean(anchorElement)}
                      anchorEl={anchorElement}
                      onClose={() => setAnchorElement(null)}
                >
                    <LogOutMenuItem onClick={() => setAnchorElement(null)}/>
                </Menu>
            </Fragment>
        );
    } else {
        return (
            <Fragment>
                <IconButton
                    color="inherit"
                    onClick={event => setAnchorElement(event.currentTarget)}
                    size="large">
                    <AccountCircle/>
                </IconButton>
                <Menu open={Boolean(anchorElement)}
                      anchorEl={anchorElement}
                      onClose={() => setAnchorElement(null)}
                >
                    <LoginMenuItem onClick={() => setAnchorElement(null)}/>
                    <RegistrationMenuItem onClick={() => setAnchorElement(null)}/>
                </Menu>
                <LoginDialog/>
                <RegistrationDialog/>
                <PasswordRecoveryDialog/>
            </Fragment>
        );
    }
});
