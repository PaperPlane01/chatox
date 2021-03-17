import React, {FunctionComponent, ReactNode, Fragment} from "react";
import {observer} from "mobx-react";
import {Menu, IconButton} from "@material-ui/core";
import {MoreVert} from "@material-ui/icons";
import {usePopupState, bindMenu, bindToggle} from "material-ui-popup-state/hooks";
import {PublishScheduledMessageNowMenuItem} from "./PublishScheduledMessageNowMenuItem";
import {canScheduleMessage} from "../permissions";
import {useStore} from "../../store/hooks";

export type ScheduledMessageMenuItemType = "publishScheduledMessage";

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

    if (canScheduleMessage(currentUserChatParticipation)) {
        menuItems.push(<PublishScheduledMessageNowMenuItem messageId={messageId}
                                                           onClick={handleMenuItemClick("publishScheduledMessage")}
            />
        )
    }

    if (menuItems.length === 0) {
        return null;
    }

    return (
        <Fragment>
            <IconButton {...bindToggle(popupState)}>
                <MoreVert/>
            </IconButton>
            <Menu {...bindMenu(popupState)}>
                {menuItems}
            </Menu>
        </Fragment>
    );
});
