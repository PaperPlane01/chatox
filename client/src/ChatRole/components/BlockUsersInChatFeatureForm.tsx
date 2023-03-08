import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Checkbox, FormControlLabel} from "@mui/material";
import {DefaultChatFeatureForm} from "./DefaultChatFeatureForm";
import {useLocalization, useStore} from "../../store";


export const BlockUsersInChatFeatureForm: FunctionComponent = observer(() => {
    const {
        chatFeaturesForm: {
            featuresForms: {
                blockUsers: {
                    formValues,
                    setFormValue
                }
            }
        }
    }= useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <DefaultChatFeatureForm formValues={formValues}
                                    name={l("chat.feature.blockUsers")}
                                    setFormValue={setFormValue}
            />
            <FormControlLabel control={
                <Checkbox checked={formValues.allowPermanent}
                          onChange={event => setFormValue("allowPermanent", event.target.checked)}
                />
            }
                              label={l("chat.feature.blockUsers.allowPermanent")}
            />
        </Fragment>
    );
});