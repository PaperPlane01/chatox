import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {EmojiEvents} from "@mui/icons-material";
import {Link} from "mobx-router";
import {useRouter, useLocalization} from "../../store";
import {commonStyles} from "../../style";
import {Routes} from "../../router";

interface RewardsManagementMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: commonStyles.undecoratedLink
}));

export const RewardsManagementMenuItem: FunctionComponent<RewardsManagementMenuItemProps> = observer(({
    onClick
}) => {
    const classes = useStyles();
    const routerStore = useRouter();
    const {l} = useLocalization();

    return (
        <Link route={Routes.rewardsManagement}
              router={routerStore}
              className={classes.undecoratedLink}
        >
            <MenuItem onClick={onClick}>
                <ListItemIcon>
                    <EmojiEvents/>
                </ListItemIcon>
                <ListItemText>
                    {l("reward.list")}
                </ListItemText>
            </MenuItem>
        </Link>
    );
});
