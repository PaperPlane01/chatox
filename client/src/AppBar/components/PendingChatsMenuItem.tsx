import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Link} from "mobx-router";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {HourglassBottom} from "@mui/icons-material";
import {useLocalization, useRouter} from "../../store";
import {commonStyles} from "../../style";
import {Routes} from "../../router";

const useStyles = makeStyles()(() => ({
    undecoratedLink: commonStyles.undecoratedLink
}));

interface PendingChatsMenuItemProps {
    onClick?: () => void
}

export const PendingChatsMenuItem: FunctionComponent<PendingChatsMenuItemProps> = observer(({
    onClick
}) => {
    const {l} = useLocalization();
    const router = useRouter();
    const {classes} = useStyles();

    const handleLick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Link route={Routes.pendingChats}
              router={router}
              className={classes.undecoratedLink}
        >
            <MenuItem onClick={handleLick}>
                <ListItemIcon>
                    <HourglassBottom/>
                </ListItemIcon>
                <ListItemText>
                    {l("pending.chat.list")}
                </ListItemText>
            </MenuItem>
        </Link>
    );
});
