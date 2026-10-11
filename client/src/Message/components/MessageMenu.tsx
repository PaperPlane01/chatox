import React, {
    Fragment,
    FunctionComponent,
    MouseEvent as ReactMouseEvent,
    ReactNode,
    useEffect,
    useRef,
    useState
} from "react";
import {observer} from "mobx-react";
import {Divider, IconButton, Menu, useTheme} from "@mui/material";
import {MoreVert} from "@mui/icons-material";
import {autoUpdate, flip, FloatingPortal, useFloating} from "@floating-ui/react";
import {BlockMessageAuthorInChatMenuItem} from "./BlockMessageAuthorInChatMenuItem";
import {ReplyToMessageMenuItem} from "./ReplyToMessageMenuItem";
import {EditMessageMenuItem} from "./EditMessageMenuItem";
import {DeleteMessageMenuItem} from "./DeleteMessageMenuItem";
import {PinMessageMenuItem} from "./PinMessageMenuItem";
import {ForwardMessageMenuItem} from "./ForwardMessageMenuItem";
import {MessageReactionPicker} from "../../MessageReaction/components";
import {useAuthorization, usePermissions, useStore} from "../../store/hooks";
import {useEntityById} from "../../entities";
import {BanUserGloballyMenuItem} from "../../GlobalBan/components";
import {ReportMessageMenuItem} from "../../Report/components";
import {BlacklistUserActionMenuItemWrapper} from "../../Blacklist/components";

export type MessageMenuItemType = "blockMessageAuthorInChat"
    | "replyToMessage"
    | "editMessage"
    | "deleteMessage"
    | "banUserGlobally"
    | "pinMessage"
    | "reportMessage"
    | "blacklistOrRemoveFromBlacklist"
    | "forwardMessage";

interface MessageMenuProps {
    messageId: string,
    onMenuItemClick?: (menuItemType: MessageMenuItemType) => void,
}

export const MessageMenu: FunctionComponent<MessageMenuProps> = observer(({
    messageId,
    onMenuItemClick,
}) => {
    const {
        messages: {
            canCreateMessage,
            canEditMessage,
            canDeleteMessage,
            canPinMessage,
            getAddReactionsFeature
        },
        chatBlockings: {
            canBlockUserInChat
        },
        globalBans: {
            canBanUsersGlobally
        }
    } = usePermissions();
    const {
        messageReactionPicker: {
            isExpanded,
            collapsePicker
        }
    } = useStore();
    const {currentUser} = useAuthorization();
    const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
    const message = useEntityById("messages", messageId);
    const theme = useTheme();
    const menuOpen = Boolean(anchorElement);
    const expanded = isExpanded(messageId);
    const {refs, floatingStyles} = useFloating({
        open: menuOpen,
        strategy: "fixed",
        placement: expanded ? "bottom-end" : "top-start",
        whileElementsMounted: autoUpdate,
        middleware: [
            flip({
                mainAxis: true,
                crossAxis: true,
                fallbackStrategy: "bestFit"
            })
        ]
    });
    const iconButtonRef = useRef<HTMLButtonElement>(null);
    const menuPaperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (expanded) {
            refs.setReference(iconButtonRef.current);
            setAnchorElement(null);
        } else if (menuOpen) {
            refs.setReference(menuPaperRef.current);
        }
    }, [expanded, menuOpen]);

    const handleOpenClick = (event: ReactMouseEvent<HTMLElement>): void => {
        setAnchorElement(event.currentTarget);
        refs.setReference(event.currentTarget);
    };

    const handleClose = (menuItemType?: MessageMenuItemType) => (): void => {
        if (onMenuItemClick && menuItemType) {
            onMenuItemClick(menuItemType);
        }

        setAnchorElement(null);
        refs.setReference(null);
        collapsePicker();
    };

    const menuItems: ReactNode[] = [];

    if (canEditMessage(message)) {
        menuItems.push(<EditMessageMenuItem messageId={messageId} onClick={handleClose("editMessage")}/>);
    }

    if (canCreateMessage(message.chatId)) {
        menuItems.push(
            <ReplyToMessageMenuItem
                messageId={messageId}
                onClick={handleClose("replyToMessage")}
            />
        );
    }

    if (currentUser) {
        menuItems.push(
            <ForwardMessageMenuItem
                messageId={messageId}
                onClick={handleClose("forwardMessage")}
            />
        );
    }

    if (canDeleteMessage(message)) {
        menuItems.push(
            <DeleteMessageMenuItem
                messageId={messageId}
                onClick={handleClose("deleteMessage")}
            />
        );
    }

    if (canBlockUserInChat(message.chatId, message.sender)) {
        menuItems.push(
            <BlockMessageAuthorInChatMenuItem
                onClick={handleClose("blockMessageAuthorInChat")}
                messageId={messageId}
            />
        );
    }

    if (canPinMessage(message.chatId)) {
        menuItems.push(<PinMessageMenuItem messageId={messageId} onClick={handleClose("pinMessage")}/>);
    }

    if (canBanUsersGlobally && message.sender !== currentUser?.id) {
        menuItems.push(
            <Divider/>,
            <BanUserGloballyMenuItem
                userId={message.sender}
                onClick={handleClose("banUserGlobally")}
            />
        );
    }

    if (!message.deleted && message.sender !== currentUser?.id) {
        menuItems.push(
            <Divider/>,
            <ReportMessageMenuItem
                messageId={messageId}
                onClick={handleClose("reportMessage")}
            />
        );
    }

    if (currentUser && message.sender !== currentUser.id) {
        menuItems.push(
            <BlacklistUserActionMenuItemWrapper
                userId={message.sender}
                onClick={handleClose("blacklistOrRemoveFromBlacklist")}
            />
        );
    }

    if (menuItems.length === 0) {
        return null;
    }

    const {
        enabled: canAddReactions,
        additional: {
            allowedEmojis
        }
    } = getAddReactionsFeature(message.chatId);

    return (
        <Fragment>
            <IconButton
                onClick={handleOpenClick}
                size="small"
                ref={ref => {
                    if (expanded) {
                        refs.setReference(ref);
                    }
                }}
            >
                <MoreVert/>
            </IconButton>
            <Menu
                open={menuOpen}
                anchorEl={anchorElement}
                onClose={handleClose()}
                slotProps={{
                    paper: {
                        ref: (ref: HTMLDivElement | null) => {
                            if (!expanded) {
                                refs.setReference(ref)
                            }
                        }
                      }
                  }}
            >
                {!expanded && menuItems}
            </Menu>
            {canAddReactions && (menuOpen || expanded) && (
                <FloatingPortal>
                    <div style={{
                        ...floatingStyles,
                        zIndex: theme.zIndex.modal + 1
                    }}
                         ref={refs.setFloating}
                    >
                        <MessageReactionPicker
                            messageId={messageId}
                            allowedEmojis={allowedEmojis}
                            onEmojiPicked={handleClose()}
                            onClose={handleClose()}
                        />
                    </div>
                </FloatingPortal>
            )}
        </Fragment>
    );
});
