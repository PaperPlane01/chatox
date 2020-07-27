import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import randomColor from "randomcolor";
import {createStyles, makeStyles, Theme, Typography} from "@material-ui/core";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User/types";
import {Routes} from "../../router";
import {getUserAvatarLabel} from "../../User/utils/get-user-avatar-label";
import {MapMobxToProps} from "../../store";

const {Link} = require("mobx-router");

interface UserLinkMobxProps {
    routerStore?: any
}

interface UserLinkOwnProps {
    user: UserEntity,
    displayAvatar: boolean,
    boldText?: boolean
}

type UserLinkProps = UserLinkMobxProps & UserLinkOwnProps;

const useStyles = makeStyles((theme: Theme) => createStyles({
    userLink: {
        color: "inherit",
        textDecoration: "none",
        display: "flex"
    },
    userNicknameTypography: {
        marginLeft: theme.spacing(1)
    }
}));

const _UserLink: FunctionComponent<UserLinkProps> = ({
    user,
    displayAvatar = false,
    boldText = false,
    routerStore
}) => {
    const classes = useStyles();
    const color = randomColor({seed: user.id});
    const avatarLabel = getUserAvatarLabel(user);
    const text = `${user.firstName} ${user.lastName ? user.lastName : ""}`;

    if (displayAvatar) {
        return (
            <Link view={Routes.userPage}
                  params={{slug: user.slug}}
                  className={classes.userLink}
                  store={routerStore}
            >
                <Avatar avatarLetter={avatarLabel}
                        avatarColor={color}
                        width={25}
                        height={25}
                        avatarUri={user.avatarUri}
                />
                <Typography className={classes.userNicknameTypography}
                            style={{color}}
                >
                    {boldText
                        ? <strong>{text}</strong>
                        : text
                    }
                </Typography>
            </Link>
        )
    } else {
        return (
            <Link view={Routes.userPage}
                  params={{slug: user.slug}}
                  className={classes.userLink}
                  store={routerStore}
            >
                <Typography style={{color}}>
                    {boldText
                        ? <strong>{text}</strong>
                        : text
                    }
                </Typography>
            </Link>
        )
    }
};

const mapMobxToProps: MapMobxToProps<UserLinkMobxProps> = ({store}) => ({
    routerStore: store
});

export const UserLink = inject(mapMobxToProps)(observer(_UserLink)) as FunctionComponent<UserLinkOwnProps>;

