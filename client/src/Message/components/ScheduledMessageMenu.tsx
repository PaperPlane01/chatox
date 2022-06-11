import React, {FunctionComponent, ReactNode, Fragment} from "react";
import {observer} from "mobx-react";
import {Menu, IconButton} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {usePopupState, bindMenu, bindToggle} from "material-ui-popup-state/hooks";
import {EditScheduledMessageMenuItem} from "./EditScheduledMessageMenuItem";
import {PublishScheduledMessageNowMenuItem} from "./PublishScheduledMessageNowMenuItem";
import {DeleteScheduledMessageMenuItem} from "./DeleteScheduledMessageMenuItem";
import {canDeleteScheduledMessage, canScheduleMessage, canUpdateScheduledMessage} from "../permissions";
import {useStore} from "../../store";

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
        entities: {
            chatParticipations: {
                findById: findChatParticipation
            },
            chats: {
                findById: findChat
            },
            scheduledMessages: {
                findById: findScheduledMessage
            }
        },
        chat: {
            selectedChatId
        }
    } = useStore();
    const popupState = usePopupState({
        popupId: `scheduledMessage-${messageId}-popup`,
        variant: "popover"
    });

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);
    const scheduledMessage = findScheduledMessage(messageId);

    if (!chat.currentUserParticipationId) {
        return null;
    }

    const currentUserChatParticipation = findChatParticipation(chat.currentUserParticipationId);

    const handleMenuItemClick = (menuItemType: ScheduledMessageMenuItemType) => (): void => {
        if (onMenuItemClick) {
            onMenuItemClick(menuItemType);
        }

        popupState.close();
    }

    const menuItems: ReactNode[] = [];

    if (canUpdateScheduledMessage(scheduledMessage, currentUserChatParticipation)) {
        menuItems.push(
            <EditScheduledMessageMenuItem messageId={messageId}
                                          onClick={handleMenuItemClick("editScheduledMessage")}
            />
        )
    }

    if (canScheduleMessage(currentUserChatParticipation)) {
        menuItems.push(
            <PublishScheduledMessageNowMenuItem messageId={messageId}
                                                onClick={handleMenuItemClick("publishScheduledMessage")}
            />
        );
    }

    if (canDeleteScheduledMessage(scheduledMessage, currentUserChatParticipation)) {
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
