import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import randomColor from "randomcolor";
import {Theme, Typography} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {Link} from "mobx-router";
import {UserEntity} from "../../User/types";
import {Routes} from "../../router";
import {getUserDisplayedName} from "../../User/utils/labels";
import {useRouter} from "../../store/hooks";
import {useLuminosity} from "../../utils/hooks";
import {UserAvatar} from "../../UserAvatar/components";

interface UserLinkProps {
    user: UserEntity,
    displayAvatar?: boolean,
    boldText?: boolean,
    avatarWidth?: number,
    avatarHeight?: number,
    identifierType?: "slug" | "id",
    onClick?: () => void
}

const useStyles = makeStyles()((theme: Theme) => ({
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
    identifierType = "slug",
    onClick
}) => {
    const routerStore = useRouter();
    const {classes} = useStyles();
    const luminosity = useLuminosity();
    const color = randomColor({seed: user.id, luminosity});
    const text = getUserDisplayedName(user);

    if (displayAvatar) {
        return (
            <div onClick={onClick}>
                <Link route={Routes.userPage}
                      params={{slug: identifierType === "slug" ? user.slug : user.id}}
                      className={classes.userLink}
                      router={routerStore}
                >
                    <UserAvatar user={user}
                                width={avatarWidth}
                                height={avatarHeight}
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
            </div>
        );
    } else {
        return (
           <div onClick={onClick}>
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
           </div>
        );
    }
});
