import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import randomColor from "randomcolor";
import {Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Link} from "mobx-router";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User";
import {Routes} from "../../router";
import {getUserAvatarLabel} from "../../User/utils/labels";
import {useRouter} from "../../store";

interface UserLinkProps {
    user: UserEntity,
    displayAvatar: boolean,
    boldText?: boolean,
    avatarWidth?: number,
    avatarHeight?: number,
    identifierType?: "slug" | "id"
}

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

export const UserLink: FunctionComponent<UserLinkProps> = observer(({
    user,
    displayAvatar = false,
    boldText = false,
    avatarWidth = 30,
    avatarHeight = 30,
    identifierType = "slug"
}) => {
    const routerStore = useRouter();
    const classes = useStyles();
    const color = randomColor({seed: user.id});
    const avatarLabel = getUserAvatarLabel(user);
    const text = `${user.firstName} ${user.lastName ? user.lastName : ""}`;

    if (displayAvatar) {
        return (
            <Link route={Routes.userPage}
                  params={{slug: identifierType === "slug" ? user.slug : user.id}}
                  className={classes.userLink}
                  router={routerStore}
            >
                <Avatar avatarLetter={avatarLabel}
                        avatarColor={color}
                        width={avatarWidth}
                        height={avatarHeight}
                        avatarId={user.avatarId}
                        avatarUri={user.externalAvatarUri}
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
        );
    } else {
        return (
            <Link route={Routes.userPage}
                  params={{slug: user.slug}}
                  className={classes.userLink}
                  router={routerStore}
            >
                <Typography style={{color}}>
                    {boldText
                        ? <strong>{text}</strong>
                        : text
                    }
                </Typography>
            </Link>
        );
    }
});
