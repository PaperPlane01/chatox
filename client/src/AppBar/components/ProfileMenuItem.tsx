import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {PersonOutlined} from "@mui/icons-material";
import {Link} from "mobx-router";
import {Routes} from "../../router";
import {useAuthorization, useLocalization, useRouter} from "../../store";

interface ProfileMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const ProfileMenuItem: FunctionComponent<ProfileMenuItemProps> = observer(({onClick}) => {
    const classes = useStyles();
    const {l} = useLocalization();
    const {currentUser} = useAuthorization();
    const routerStore = useRouter();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    if (currentUser) {
        return (
            <Link router={routerStore}
                  className={classes.undecoratedLink}
                  route={Routes.userPage}
                  params={{slug: currentUser.slug || currentUser.id}}
            >
                <MenuItem onClick={handleClick}>
                    <ListItemIcon>
                        <PersonOutlined/>
                    </ListItemIcon>
                    <ListItemText>
                        {l("user.profile")}
                    </ListItemText>
                </MenuItem>
            </Link>
        )
    } else {
        return null;
    }
});
