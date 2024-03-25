import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Card,
    CardContent,
    CardHeader,
    Divider,
    FormControlLabel,
    FormHelperText,
    Radio,
    RadioGroup,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import {MessageEditorType, parseMessageEditorType, parseSendMessageButton, SendMessageButton} from "../types";
import {useLocalization, useStore} from "../../store";

interface ChatsPreferencesCardProps {
    hideHeader?: boolean
}

export const ChatsPreferencesCard: FunctionComponent<ChatsPreferencesCardProps> = observer(({hideHeader = false}) => {
    const {
        chatsPreferences: {
            enableVirtualScroll,
            setEnableVirtualScroll,
            setVirtualScrollOverscan,
            virtualScrollOverscan,
            sendMessageButton,
            setSendMessageButton,
            enablePartialVirtualization,
            setEnablePartialVirtualization,
            useSharedWorker,
            setUseSharedWorker,
            sendTypingNotification,
            setSendTypingNotification,
            displayUnreadMessagesCount,
            setDisplayUnreadMessagesCount,
            displayUnreadChatsCount,
            setDisplayUnreadChatsCount,
            messageEditorType,
            setMessageEditorType
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            {!hideHeader && <CardHeader title={l("settings.chats")}/>}
            <CardContent>
                <Fragment>
                    <Typography variant="h6">
                        {l("common.messages")}
                    </Typography>
                    <RadioGroup value={sendMessageButton}
                                onChange={event => setSendMessageButton(parseSendMessageButton(event.target.value))}
                    >
                        <FormControlLabel control={<Radio/>}
                                          label={l("settings.chat.messages.send-message-button.CTRL_ENTER")}
                                          value={SendMessageButton.CTRL_ENTER}
                        />
                        <FormControlLabel control={<Radio/>}
                                          label={l("settings.chat.messages.send-message-button.ENTER")}
                                          value={SendMessageButton.ENTER}
                        />
                    </RadioGroup>
                    <Divider/>
                    <RadioGroup value={messageEditorType}
                                onChange={event => setMessageEditorType(parseMessageEditorType(event.target.value))}
                    >
                        <FormControlLabel control={<Radio/>}
                                          label={l("settings.chat.messages.editor-type.PLAIN_TEXT")}
                                          value={MessageEditorType.PLAIN_TEXT}
                        />
                        <FormControlLabel control={<Radio/>}
                                          label={l("settings.chat.messages.editor-type.RICH_TEXT")}
                                          value={MessageEditorType.RICH_TEXT}
                        />
                    </RadioGroup>
                    <FormControlLabel control={
                        <Switch checked={sendTypingNotification}
                                onChange={() => setSendTypingNotification(!sendTypingNotification)}/>
                    }
                                      label={l("settings.chat.send-typing-notification")}
                    />
                </Fragment>
                <Divider/>
                <Typography variant="h6">
                    {l("settings.chat.virtual-scroll")}
                </Typography>
                <FormControlLabel control={
                    <Switch checked={enableVirtualScroll} onChange={() => setEnableVirtualScroll(!enableVirtualScroll)}/>
                }
                                  label={l("settings.chats.virtual-scroll.enable-virtual-scroll")}
                />
                {enableVirtualScroll && (
                    <TextField fullWidth
                               margin="dense"
                               onChange={event => setVirtualScrollOverscan(Number(event.target.value))}
                               value={virtualScrollOverscan}
                               label={l("settings.chat.virtual-scroll.overscan-value")}
                               type="number"
                               inputProps={{
                                   min: 0
                               }}
                    />
                )}
                {!enableVirtualScroll && (
                    <FormControlLabel control={
                        <Switch checked={enablePartialVirtualization}
                                onChange={() => setEnablePartialVirtualization(!enablePartialVirtualization)}
                        />
                    }
                                      label={l("settings.chat.virtual-scroll.enable-partial-virtualization")}
                    />
                )}
                <Divider/>
                <Typography variant="h6">
                    {l("settings.chat.server-connection")}
                </Typography>
                <Fragment>
                    <FormControlLabel control={
                        <Switch checked={useSharedWorker}
                                onChange={() => setUseSharedWorker(!useSharedWorker)}
                        />
                    }
                                      label={l("settings.chat.use-shared-worker")}
                    />
                    <FormHelperText>
                        {l("settings.chat.use-shared-worker.explained")}
                    </FormHelperText>
                </Fragment>
                <Divider/>
                <Typography variant="h6">
                    {l("settings.chat.notifications")}
                </Typography>
                <Fragment>
                    <FormControlLabel control={
                        <Switch checked={displayUnreadMessagesCount}
                                onChange={() => setDisplayUnreadMessagesCount(!displayUnreadMessagesCount)}
                        />
                    }
                                      label={l("settings.chat.display-unread-messages-count")}
                    />
                    {displayUnreadMessagesCount && (
                        <FormControlLabel control={
                            <Switch checked={displayUnreadChatsCount}
                                    onChange={() => setDisplayUnreadChatsCount(!displayUnreadChatsCount)}
                            />
                        }
                                          label={l("settings.chat.display-unread-chats-count")}
                        />
                    )}
                </Fragment>
            </CardContent>
        </Card>
    );
});
