import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@material-ui/core";
import {Delete} from "@material-ui/icons";
import {ChatDeletionStep} from "../types";
import {useLocalization, useStore} from "../../store/hooks";

interface DeleteChatMenuItemProps {
    onClick?: () => void
}

export const DeleteChatMenuItem: FunctionComponent<DeleteChatMenuItemProps> = observer(({onClick}) => {
    const {
        chatDeletion: {
            setCurrentStep
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        setCurrentStep(ChatDeletionStep.CONFIRM_CHAT_DELETION);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <Delete/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.delete")}
            </ListItemText>
        </MenuItem>
    );
});