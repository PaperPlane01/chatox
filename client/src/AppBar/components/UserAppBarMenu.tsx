import React, {Fragment, FunctionComponent, useState} from "react";
import {observer} from "mobx-react";
import {Button, IconButton, Menu} from "@material-ui/core";
import {Skeleton} from "@material-ui/lab";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import randomColor from "randomcolor";
import {RegistrationDialog, RegistrationMenuItem} from "../../Registration";
import {LoginDialog, LoginMenuItem, LogOutMenuItem} from "../../Authorization";
import {Avatar} from "../../Avatar";
import {useAuthorization} from "../../store";

export const UserAppBarMenu: FunctionComponent = observer(() => {
    const [anchorElement, setAnchorElement] = useState<Element | null>(null);
    const {currentUser, fetchingCurrentUser} = useAuthorization();

    if (fetchingCurrentUser) {
        return (
            <Fragment>
                <Skeleton variant="circle" height={40} width={40}/>
                <Skeleton variant="text" height={20} width={50}/>
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
                                avatarId={currentUser.avatarId}
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
});
