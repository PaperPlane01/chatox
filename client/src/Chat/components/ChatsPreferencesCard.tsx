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
import {parseSendMessageButton, SendMessageButton} from "../types";
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
            setUseSharedWorker
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
            </CardContent>
        </Card>
    );
});
