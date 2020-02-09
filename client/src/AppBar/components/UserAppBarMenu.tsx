import React, {Fragment, FunctionComponent, useState} from "react";
import {inject, observer} from "mobx-react";
import {Button, IconButton, Menu} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import randomColor from "randomcolor";
import {RegistrationDialog, RegistrationMenuItem} from "../../Registration";
import {LoginDialog, LoginMenuItem, LogOutMenuItem} from "../../Authorization";
import {Avatar} from "../../Avatar";
import {CurrentUser} from "../../api/types/response";
import {IAppState} from "../../store";

interface UserAppBarMenuMobxProps {
    currentUser?: CurrentUser,
    fetchingCurrentUser: boolean
}

const _UserAppBarMenu: FunctionComponent<UserAppBarMenuMobxProps> = ({currentUser, fetchingCurrentUser}) => {
    const [anchorElement, setAnchorElement] = useState<Element | null>(null);

    if (fetchingCurrentUser) {
        return (
            <Fragment>
                <Skeleton variant="circle"/>
                <Skeleton variant="text"/>
            </Fragment>
        )
    } else if (currentUser) {
        let avatarLetter = `${currentUser.firstName[0]}`;

        if (currentUser.lastName) {
            avatarLetter = `${avatarLetter}${currentUser.lastName[0]}`;
        }

        return (
            <Fragment>
                <Button onClick={event => setAnchorElement(event.currentTarget)}
                        color="inherit"
                >
                    <div style={{marginRight: 14}}>
                        <Avatar avatarLetter={avatarLetter}
                                avatarColor={randomColor({seed: currentUser.id})}
                                avatarUri={currentUser.avatarUri}
                        />
                    </div>
                    {currentUser.firstName}{currentUser.lastName && ` ${currentUser.lastName}`}
                </Button>
                <Menu open={Boolean(anchorElement)}
                      anchorEl={anchorElement}
                      onClose={() => setAnchorElement(null)}
                >
                    <LogOutMenuItem onClick={() => setAnchorElement(null)}/>
                </Menu>
            </Fragment>
        )
    } else {
        return (
            <Fragment>
                <IconButton color="inherit"
                            onClick={event => setAnchorElement(event.currentTarget)}
                >
                    <AccountCircleIcon/>
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
            </Fragment>
        )
    }
};

const mapMobxToProps = (state: IAppState): UserAppBarMenuMobxProps => ({
    currentUser: state.authorization.currentUser,
    fetchingCurrentUser: state.authorization.fetchingCurrentUser
});

export const UserAppBarMenu = inject(mapMobxToProps)(observer(_UserAppBarMenu as FunctionComponent));
