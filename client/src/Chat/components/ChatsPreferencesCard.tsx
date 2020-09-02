import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Card, CardHeader, CardContent, FormControlLabel, Switch} from "@material-ui/core";
import {useLocalization, useStore} from "../../store/hooks";

interface ChatsPreferencesCardProps {
    hideHeader?: boolean
}

export const ChatsPreferencesCard: FunctionComponent<ChatsPreferencesCardProps> = observer(({hideHeader = false}) => {
    const {
        chatsPreferences: {
            useVirtualScroll,
            setUseVirtualScroll
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Card>
            {!hideHeader && <CardHeader title={l("settings.chats")}/>}
            <CardContent>
                <FormControlLabel control={
                    <Switch checked={useVirtualScroll} onChange={() => setUseVirtualScroll(!useVirtualScroll)}/>
                }
                                  label={l("settings.chats.use-virtual-scroll")}
                />
            </CardContent>
        </Card>
    )
})
