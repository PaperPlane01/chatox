import React, {FunctionComponent} from "react";
import {inject} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText, createStyles, makeStyles} from "@material-ui/core";
import ChatBubbleIcon from "@material-ui/icons/ChatBubble";
import {Routes} from "../../router";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

const {Link} = require("mobx-router");

interface MyChatsMenuItemMobxProps {
    routerStore?: any
}

interface MyChatsMenuItemOwnProps {
    onClick?: () => void
}

type MyChatsMenuItemProps = MyChatsMenuItemMobxProps & MyChatsMenuItemOwnProps & Localized;

const useStyles = makeStyles(() => createStyles({
    undecoratedLink: {
        textDecoration: "none",
        color: "inherit"
    }
}));

const _MyChatsMenuItem: FunctionComponent<MyChatsMenuItemProps> = ({
    routerStore,
    onClick,
    l
}) => {
    const classes = useStyles();

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
};

const mapMobxToProps: MapMobxToProps<MyChatsMenuItemMobxProps> = ({store}) => ({
    routerStore: store
});

export const MyChatsMenuItem = localized(
    inject(mapMobxToProps)(_MyChatsMenuItem)
) as FunctionComponent<MyChatsMenuItemOwnProps>;
