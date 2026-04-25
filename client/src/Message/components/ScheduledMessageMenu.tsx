import React, {Fragment, FunctionComponent, ReactNode} from "react";
import {observer} from "mobx-react";
import {IconButton, Menu} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {EditScheduledMessageMenuItem} from "./EditScheduledMessageMenuItem";
import {PublishScheduledMessageNowMenuItem} from "./PublishScheduledMessageNowMenuItem";
import {DeleteScheduledMessageMenuItem} from "./DeleteScheduledMessageMenuItem";
import {usePermissions} from "../../store";
import {useEntityById} from "../../entities";

export type ScheduledMessageMenuItemType = "publishScheduledMessage" | "deleteScheduledMessage" | "editScheduledMessage";

interface ScheduledMessageMenuProps {
    messageId: string,
    onMenuItemClick?: (menuItemType: ScheduledMessageMenuItemType) => void
}

export const ScheduledMessageMenu: FunctionComponent<ScheduledMessageMenuProps> = observer(({
    messageId,
    onMenuItemClick
}) => {
    const {
        messages: {
            canScheduleMessage,
            canUpdateScheduledMessage,
            canDeleteScheduledMessage
        }
    } = usePermissions();
    const popupState = usePopupState({
        popupId: `scheduledMessage-${messageId}-popup`,
        variant: "popover"
    });

    const scheduledMessage = useEntityById("scheduledMessages", messageId);

    const handleMenuItemClick = (menuItemType: ScheduledMessageMenuItemType) => (): void => {
        if (onMenuItemClick) {
            onMenuItemClick(menuItemType);
        }

        popupState.close();
    }

    const menuItems: ReactNode[] = [];

    if (canUpdateScheduledMessage(scheduledMessage)) {
        menuItems.push(
            <EditScheduledMessageMenuItem messageId={messageId}
                                          onClick={handleMenuItemClick("editScheduledMessage")}
            />
        )
    }

    if (canScheduleMessage(scheduledMessage.chatId)) {
        menuItems.push(
            <PublishScheduledMessageNowMenuItem messageId={messageId}
                                                onClick={handleMenuItemClick("publishScheduledMessage")}
            />
        );
    }

    if (canDeleteScheduledMessage(scheduledMessage)) {
        menuItems.push(
            <DeleteScheduledMessageMenuItem messageId={messageId}
                                            onClick={handleMenuItemClick("deleteScheduledMessage")}
            />
        );
    }

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <Fragment>
            <IconButton {...bindToggle(popupState)} size="large">
                <MoreVert/>
            </IconButton>
            <Menu {...bindMenu(popupState)}>
                {menuItems}
            </Menu>
        </Fragment>
    );
});
