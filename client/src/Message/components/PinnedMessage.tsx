import React, {forwardRef, Fragment, SyntheticEvent} from "react";
import {observer} from "mobx-react";
import {Card, CardContent, CardHeader, IconButton, Menu, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Close} from "@mui/icons-material";
import {bindMenu, bindToggle, usePopupState} from "material-ui-popup-state/hooks";
import {ClosePinnedMessageMenuItem} from "./ClosePinnedMessageMenuItem";
import {UnpinMessageMenuItem} from "./UnpinMessageMenuItem";
import {useLocalization, usePermissions, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {ensureEventWontPropagate} from "../../utils/event-utils";
import {MarkdownTextWithEmoji} from "../../Markdown";

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
        messageDialog: {
            setMessageId
        },
        closedPinnedMessages: {
            closePinnedMessage,
            closePinnedMessagesMap
        }
    } = useStore();
    const {
        messages: {
            canUnpinMessage
        }
    } = usePermissions();
    const classes = useStyles();
    const {l} = useLocalization();
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

    const chat = useEntityById("chats", selectedChatId);
    const pinnedMessage = useEntityById("messages", chat?.pinnedMessageId);

    if (!chat?.pinnedMessageId) {
        return null;
    }

    if (!closePinnedMessagesMap[chat.pinnedMessageId] || !pinnedMessage) {
        return null;
    }

    const ableToUnpinMessage = canUnpinMessage(pinnedMessage.chatId);

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
                    }}
                    >
                        {pinnedMessage.deleted
                            ? <i>{l("message.deleted")}</i>
                            : (
                                <MarkdownTextWithEmoji text={pinnedMessage.text}
                                                       emojiData={pinnedMessage.emoji}
                                                       renderParagraphsAsSpan
                                                       renderHeadersAsPlainText
                                                       renderQuotesAsPlainText
                                                       renderLinksAsPlainText
                                                       renderCodeAsPlainText
                                />
                            )
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
                                size="large"
                            >
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
                            size="large"
                        >
                            <Close/>
                        </IconButton>
                    )
                }
            </CardContent>
        </Card>
    );
});

export const PinnedMessage = observer(_PinnedMessage);
