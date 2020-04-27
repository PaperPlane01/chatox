import React, {FunctionComponent, MouseEvent, ReactNode, useState} from "react";
import {IconButton, Menu} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {ChatBlockingsMenuItem} from "./ChatBlockingsMenuItem";

export const ChatMenu: FunctionComponent = () => {
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const menuOpen = Boolean(anchorElement);

    const handleOpenClick = (event: MouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
    };

    const handleClose = (): void => {
        setAnchorElement(null);
    };

    const menuItems: ReactNode[] = [];
    menuItems.push(<ChatBlockingsMenuItem onClick={handleClose}/>);

    if (menuItems.filter(item => item !== null).length === 0) {
        return null;
    }

    return (
        <div>
            <IconButton onClick={handleOpenClick} color="inherit">
                <MoreVert/>
            </IconButton>
            <Menu open={menuOpen}
                  onClose={handleClose}
                  anchorEl={anchorElement}
            >
                {menuItems}
            </Menu>
        </div>
    )
};
