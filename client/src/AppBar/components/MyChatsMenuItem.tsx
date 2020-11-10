import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, ListItemIcon, ListItemText, makeStyles, MenuItem} from "@material-ui/core";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import {Routes} from "../../router";
import {useLocalization, useRouter} from "../../store";

const {Link} = require("mobx-router");

interface MyChatsMenuItemProps {
    onClick?: () => void
}

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

export const MyChatsMenuItem: FunctionComponent<MyChatsMenuItemProps> = observer(({onClick}) => {
    const classes = useStyles();
    const {l} = useLocalization();
    const routerStore = useRouter();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <Link view={Routes.myChats}
              store={routerStore}
              className={classes.undecoratedLink}
        >
            <MenuItem onClick={handleClick}>
                <ListItemIcon>
                    <ChatBubbleIcon/>
                </ListItemIcon>
                <ListItemText>
                    {l("chat.my-chats")}
                </ListItemText>
            </MenuItem>
        </Link>
    )
});
