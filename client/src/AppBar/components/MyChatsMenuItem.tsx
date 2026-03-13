import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {ChatBubble} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {Link} from "mobx-router";
import {commonStyles} from "../../style";
import {Routes} from "../../router";
import {useLocalization, useRouter} from "../../store";

interface MyChatsMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles()(() => ({
    undecoratedLink: commonStyles.undecoratedLink
}));

export const MyChatsMenuItem: FunctionComponent<MyChatsMenuItemProps> = observer(({onClick}) => {
    const {classes} = useStyles();
    const {l} = useLocalization();
    const routerStore = useRouter();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Link route={Routes.myChats}
              router={routerStore}
              className={classes.undecoratedLink}
        >
            <MenuItem onClick={handleClick}>
                <ListItemIcon>
                    <ChatBubble/>
                </ListItemIcon>
                <ListItemText>
                    {l("chat.my-chats")}
                </ListItemText>
            </MenuItem>
        </Link>
    )
});
