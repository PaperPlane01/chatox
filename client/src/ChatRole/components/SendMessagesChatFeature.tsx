import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Checkbox, FormControlLabel} from "@mui/material";
import {DefaultChatFeature} from "./DefaultChatFeature";
import {useLocalization} from "../../store";
import {SendMessagesFeatureData} from "../../api/types/response";

interface SendMessagesChatFeatureProps {
    feature: SendMessagesFeatureData
}

export const SendMessagesChatFeature: FunctionComponent<SendMessagesChatFeatureProps> = observer(({
    feature
}) => {
    const {l} = useLocalization();

    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <DefaultChatFeature name={l("chat.feature.sendMessages")} feature={feature}/>
            <div>
                <FormControlLabel control={<Checkbox checked={feature.additional.allowedToSendImages}/>}
                                  label={l("chat.feature.sendMessages.allowedToSendImages")}
                />
                <FormControlLabel control={<Checkbox checked={feature.additional.allowedToSendStickers}/>}
                                  label={l("chat.feature.sendMessages.allowedToSendStickers")}
                />
                <FormControlLabel control={<Checkbox checked={feature.additional.allowedToSendFiles}/>}
                                  label={l("chat.feature.sendMessages.allowedToSendFiles")}
                />
                <FormControlLabel control={<Checkbox checked={feature.additional.allowedToSendVoiceMessages}/>}
                                  label={l("chat.feature.sendMessages.allowedToSendAudios")}
                />
                <FormControlLabel control={<Checkbox checked={feature.additional.allowedToSendVoiceMessages}/>}
                                  label={l("chat.feature.sendMessages.allowedToSendVoiceMessages")}
                />
                <FormControlLabel control={<Checkbox checked={feature.additional.allowedToSendVideos}/>}
                                  label={l("chat.feature.sendMessages.allowedToSendVideos")}
                />
            </div>
        </div>
    );
});
