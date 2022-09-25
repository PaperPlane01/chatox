import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControlLabel, Checkbox} from "@mui/material";
import {DefaultChatFeatureForm} from "./DefaultChatFeatureForm";
import {useStore, useLocalization} from "../../store";

export const SendMessagesChatFeatureForm: FunctionComponent = observer(() => {
    const {
        chatFeaturesForm: {
            featuresForms: {
                sendMessages: {
                    formValues,
                    setFormValue
                }
            }
        }
    } = useStore();
    const {l} = useLocalization();
    
    return (
        <div style={{display: "flex", flexDirection: "column"}}>
            <DefaultChatFeatureForm name={l("chat.feature.sendMessages")}
                                    formValues={formValues}
                                    setFormValue={setFormValue}
            />
            <div>
                <FormControlLabel control={
                    <Checkbox checked={formValues.enabled} 
                              onChange={event => setFormValue("enabled", event.target.checked)}
                    />
                }
                                  label={l("chat.feature.sendMessages.allowedToSendImages")}
                />
                <FormControlLabel control={
                    <Checkbox checked={formValues.allowedToSendStickers}
                              onChange={event => setFormValue("allowedToSendStickers", event.target.checked)}
                    />
                }
                                  label={l("chat.feature.sendMessages.allowedToSendStickers")}
                />
                <FormControlLabel control={
                    <Checkbox checked={formValues.allowedToSendFiles}
                              onChange={event => setFormValue("allowedToSendFiles", event.target.checked)}
                    />
                }
                                  label={l("chat.feature.sendMessages.allowedToSendFiles")}
                />
                <FormControlLabel control={
                    <Checkbox checked={formValues.allowedToSendAudios}
                              onChange={event => setFormValue("allowedToSendAudios", event.target.checked)}
                    />
                }
                                  label={l("chat.feature.sendMessages.allowedToSendAudios")}
                />
                <FormControlLabel control={
                    <Checkbox checked={formValues.allowedToSendVoiceMessages}
                              onChange={event => setFormValue("allowedToSendVoiceMessages", event.target.checked)}
                    />
                }
                                  label={l("chat.feature.sendMessages.allowedToSendVoiceMessages")}
                />
                <FormControlLabel control={
                    <Checkbox checked={formValues.allowedToSendVideos}
                              onChange={event => setFormValue("allowedToSendVideos", event.target.checked)}
                    />
                }
                                  label={l("chat.feature.sendMessages.allowedToSendVideos")}
                />
            </div>
        </div>
    );
});