import React, {forwardRef, Fragment, SyntheticEvent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, IconButton, Menu, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Close} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {ClosePinnedMessageMenuItem} from "./ClosePinnedMessageMenuItem";
import {UnpinMessageMenuItem} from "./UnpinMessageMenuItem";
import {useAuthorization, useLocalization, useStore} from "../../store";
import {useEmojiParser} from "../../Emoji";
import {canUnpinMessage} from "../permissions";
import {ensureEventWontPropagate} from "../../utils/event-utils";

interface PinnedMessageProps {
    width?: string | number
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    cardRoot: {
        maxHeight: 120,
        [theme.breakpoints.down('lg')]: {
            position: "fixed",
            zIndex: theme.zIndex.modal - 1
        }
    },
    cardContentRoot: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        borderLeft: "4px solid",
        borderLeftColor: theme.palette.primary.main,
        cursor: "pointer",
        display: "flex",
        paddingLeft: theme.spacing(1),
        "&:last-child": {
            paddingBottom: theme.spacing(1)
        }
    },
    cardHeaderRoot: {
        paddingLeft: theme.spacing(2),
        paddingTop: 0,
        paddingBottom: 0,
        paddingRight: 0
    },
    cardContentTypography: {
        width: "100%",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden"
    },
    truncatedTextContainer: {
        minWidth: 0,
        flex: 1
    },
    unpinButton: {
        padding: 0
    }
}));

const _PinnedMessage = forwardRef<HTMLDivElement, PinnedMessageProps>((props, ref) => {
    const {
        chat: {
            selectedChatId
        },
        entities: {
            chats: {
                findById: findChat
            },
            messages: {
                findById: findMessage
            },
            chatParticipations: {
                findByUserAndChat: findChatParticipation
            }
        },
        messageDialog: {
            setMessageId
        },
        closedPinnedMessages: {
            closePinnedMessage,
            closePinnedMessagesMap
        }
    } = useStore();
    const classes = useStyles();
    const {parseEmoji} = useEmojiParser();
    const {l} = useLocalization();
    const {currentUser} = useAuthorization();
    const closeOrUnpinMessageMenuPopupState = usePopupState({
        variant: "popover",
        popupId: "closeOrUnpinMessageMenuPopup"
    });
    const closeOrUnpinMessageMenuButtonProps = bindToggle(closeOrUnpinMessageMenuPopupState);
    const originalOnClickHandler = closeOrUnpinMessageMenuButtonProps.onClick;
    closeOrUnpinMessageMenuButtonProps.onClick = (event: SyntheticEvent<any>): void => {
        originalOnClickHandler(event);
        ensureEventWontPropagate(event);
    };

    if (!selectedChatId) {
        return null;
    }

    const chat = findChat(selectedChatId);

    if (!chat.pinnedMessageId) {
        return null;
    }

    if (closePinnedMessagesMap[chat.pinnedMessageId]) {
        return null;
    }

    const pinnedMessage = findMessage(chat.pinnedMessageId);
    const currentUserChatParticipation = currentUser
        ? findChatParticipation({chatId: selectedChatId, userId: currentUser.id})
        : undefined;
    const ableToUnpinMessage = canUnpinMessage(currentUserChatParticipation);

    return (
        <Card ref={ref}
              classes={{
                  root: classes.cardRoot
              }}
              style={{width: props.width}}
        >
            <CardHeader classes={{
                root: classes.cardHeaderRoot
            }}
                        subheader={l("message.pinned")}
                        subheaderTypographyProps={{
                            color: "textPrimary"
                        }}
            />
            <CardContent classes={{
                root: classes.cardContentRoot
            }}
                         onClick={() => setMessageId(pinnedMessage.id)}
            >
                <div className={classes.truncatedTextContainer}>
                    <Typography classes={{
                        root: classes.cardContentTypography
                    }}>
                        {pinnedMessage.deleted
                            ? <i>{l("message.deleted")}</i>
                            : parseEmoji(pinnedMessage.text, pinnedMessage.emoji)
                        }
                    </Typography>
                </div>
                {ableToUnpinMessage
                    ? (
                        <Fragment>
                            <IconButton
                                className={classes.unpinButton}
                                disableRipple
                                {...closeOrUnpinMessageMenuButtonProps}
                                size="large">
                                <Close/>
                            </IconButton>
                            <Menu {...bindMenu(closeOrUnpinMessageMenuPopupState)}>
                                <ClosePinnedMessageMenuItem messageId={chat.pinnedMessageId}
                                                            onClick={event => {
                                                                ensureEventWontPropagate(event);
                                                                closeOrUnpinMessageMenuPopupState.close();
                                                            }}
                                />
                                <UnpinMessageMenuItem onClick={event => {
                                    ensureEventWontPropagate(event);
                                    closeOrUnpinMessageMenuPopupState.close();
                                }}/>
                            </Menu>
                        </Fragment>
                    )
                    : (
                        <IconButton
                            onClick={event => {
                                ensureEventWontPropagate(event);

                                if (chat.pinnedMessageId) {
                                    closePinnedMessage(chat.pinnedMessageId);
                                }
                            }}
                            className={classes.unpinButton}
                            disableRipple
                            size="large">
                            <Close/>
                        </IconButton>
                    )
                }
            </CardContent>
        </Card>
    );
});

export const PinnedMessage = observer(_PinnedMessage);
