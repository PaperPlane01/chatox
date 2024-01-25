import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {ListItemIcon, ListItemText, MenuItem} from "@mui/material";
import {Badge, Block, Delete, Info, InsertLink, LockClock, Security, PersonAdd} from "@mui/icons-material";
import {ChatManagementMenuItemRenderers, ChatManagementTab} from "../types";
import {TranslatedText} from "../../localization";

const chatManagementMenuItemRenderers: ChatManagementMenuItemRenderers = {
    BLOCKINGS: (
        <MenuItem>
            <ListItemIcon>
                <Block/>
            </ListItemIcon>
            <ListItemText>
                <TranslatedText label="chat.management.tab.BLOCKINGS"/>
            </ListItemText>
        </MenuItem>
    ),
    DELETION: (
        <MenuItem>
            <ListItemIcon>
                <Delete/>
            </ListItemIcon>
            <ListItemText>
                <TranslatedText label="chat.management.tab.DELETION"/>
            </ListItemText>
        </MenuItem>
    ),
    INFO: (
        <MenuItem>
            <ListItemIcon>
                <Info/>
            </ListItemIcon>
            <ListItemText>
                <TranslatedText label="chat.management.tab.INFO"/>
            </ListItemText>
        </MenuItem>
    ),
    PARTICIPANTS: (
        <MenuItem>
            <ListItemIcon>
                <LockClock/>
            </ListItemIcon>
            <ListItemText>
                <TranslatedText label="chat.management.tab.SLOW_MODE"/>
            </ListItemText>
        </MenuItem>
    ),
    ROLES: (
        <MenuItem>
            <ListItemIcon>
                <Badge/>
            </ListItemIcon>
            <ListItemText>
                <TranslatedText label="chat.management.tab.ROLES"/>
            </ListItemText>
        </MenuItem>
    ),
    INVITES: (
        <MenuItem>
            <ListItemIcon>
                <InsertLink/>
            </ListItemIcon>,
            <ListItemText>
                <TranslatedText label="chat.invite.list"/>
            </ListItemText>
        </MenuItem>
    ),
    JOIN_REQUESTS: (
        <MenuItem>
            <ListItemIcon>
                <PersonAdd/>
            </ListItemIcon>
            <ListItemText>
                <TranslatedText label="chat.join.requests"/>
            </ListItemText>
        </MenuItem>
    ),
    SECURITY: (
        <MenuItem>
            <ListItemIcon>
                <Security/>
            </ListItemIcon>
            <ListItemText>
                <TranslatedText label="chat.management.tab.SECURITY"/>
            </ListItemText>
        </MenuItem>
    ),
    SLOW_MODE: (
        <MenuItem>
            <ListItemIcon>
                <LockClock/>
            </ListItemIcon>
            <ListItemText>
                <TranslatedText label="chat.management.tab.SLOW_MODE"/>
            </ListItemText>
        </MenuItem>
    )
};

const renderChatManagementMenuItem = (tab: ChatManagementTab): ReactNode => chatManagementMenuItemRenderers[tab];

interface ChatManagementMenuItemProps {
    tab: ChatManagementTab
}

export const ChatManagementMenuItemWrapper: FunctionComponent<ChatManagementMenuItemProps> = observer(({
    tab
}) => (
    <Fragment>
        {renderChatManagementMenuItem(tab)}
    </Fragment>
));
