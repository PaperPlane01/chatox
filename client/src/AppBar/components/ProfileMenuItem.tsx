import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {PersonOutlined} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {Link} from "mobx-router";
import {commonStyles} from "../../style";
import {Routes} from "../../router";
import {useAuthorization, useLocalization, useRouter} from "../../store";

interface ProfileMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles()(() => ({
    undecoratedLink: commonStyles.undecoratedLink
}));

export const ProfileMenuItem: FunctionComponent<ProfileMenuItemProps> = observer(({onClick}) => {
    const { classes } = useStyles();
    const {l} = useLocalization();
    const {currentUser} = useAuthorization();
    const routerStore = useRouter();

    if (!currentUser) {
        return null;
    }

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Link router={routerStore}
              className={classes.undecoratedLink}
              route={Routes.userPage}
              params={{slug: currentUser.slug ?? currentUser.id}}
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
    );
});
