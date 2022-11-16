import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {
    Card,
    CardContent,
    CardHeader,
    Divider,
    FormControlLabel,
    Radio,
    RadioGroup,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import {
    parseReverseScrollingDirectionOptionFromString,
    parseSendMessageButton,
    parseVirtualScrollElementFromString,
    ReverseScrollDirectionOption,
    SendMessageButton,
    VirtualScrollElement
} from "../types";
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
            reverseScrollingDirectionOption,
            setReverseScrollDirectionOption,
            restoredScrollingSpeedCoefficient,
            setReversedScrollSpeedCoefficient,
            enableImagesCaching,
            setEnableImagesCaching,
            virtualScrollElement,
            setVirtualScrollElement,
            sendMessageButton,
            setSendMessageButton
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
                {enableVirtualScroll && (
                    <Fragment>
                        <Typography variant="h6">
                            {l("settings.chat.virtual-scroll.scrollable-element")}
                        </Typography>
                        <RadioGroup value={virtualScrollElement}
                                    onChange={event => setVirtualScrollElement(parseVirtualScrollElementFromString(event.target.value))}
                        >
                            <FormControlLabel control={<Radio/>}
                                              label={l("settings.chat.virtual-scroll.scrollable-element.MESSAGES_LIST")}
                                              value={VirtualScrollElement.MESSAGES_LIST}
                            />
                            <FormControlLabel control={<Radio/>}
                                              label={l("settings.chat.virtual-scroll.scrollable-element.WINDOW")}
                                              value={VirtualScrollElement.WINDOW}
                            />
                        </RadioGroup>
                        {virtualScrollElement !== VirtualScrollElement.WINDOW && (
                            <Fragment>
                                <Typography variant="h6">
                                    {l("settings.chat.virtual-scroll.scroll-direction-behavior")}
                                </Typography>
                                <RadioGroup value={reverseScrollingDirectionOption}
                                            onChange={event => setReverseScrollDirectionOption(parseReverseScrollingDirectionOptionFromString(event.target.value))}
                                >
                                    <FormControlLabel control={<Radio/>}
                                                      label={l("settings.chat.virtual-scroll.scroll-direction-behavior.do-not-reverse")}
                                                      value={ReverseScrollDirectionOption.DO_NOT_REVERSE}
                                    />
                                    <FormControlLabel control={<Radio/>}
                                                      label={l("settings.chat.virtual-scroll.scroll-direction-behavior.reverse")}
                                                      value={ReverseScrollDirectionOption.REVERSE}
                                    />
                                    <FormControlLabel control={<Radio/>}
                                                      label={l("settings.chat.virtual-scroll.scroll-direction-behavior.reverse-and-try-to-restore")}
                                                      value={ReverseScrollDirectionOption.REVERSE_AND_TRY_TO_RESTORE}
                                    />
                                </RadioGroup>
                                {reverseScrollingDirectionOption === ReverseScrollDirectionOption.REVERSE_AND_TRY_TO_RESTORE && (
                                    <TextField fullWidth
                                               margin="dense"
                                               onChange={event => setReversedScrollSpeedCoefficient(Number(event.target.value))}
                                               label={l("setting.chat.virtual-scroll.reversed-scroll-speed-coefficient")}
                                               value={restoredScrollingSpeedCoefficient}
                                               type="number"
                                               inputProps={{
                                                   step: 0.0001
                                               }}
                                    />
                                )}
                                <FormControlLabel control={
                                    <Switch checked={enableImagesCaching} onChange={() => setEnableImagesCaching(!enableImagesCaching)}/>
                                }
                                                  label={l("settings.chat.virtual-scroll.enable-images-caching")}
                                />
                            </Fragment>
                        )}
                    </Fragment>
                )}
            </CardContent>
        </Card>
    );
});
