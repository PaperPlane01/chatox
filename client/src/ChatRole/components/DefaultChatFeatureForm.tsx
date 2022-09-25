import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControlLabel, Checkbox, Typography} from "@mui/material";
import {ChatFeatureFormData} from "../types";
import {useLocalization} from "../../store";

interface DefaultChatFeatureFormProps {
    formValues: ChatFeatureFormData,
    name: string,
    setFormValue: <Key extends keyof ChatFeatureFormData>(key: Key, value: ChatFeatureFormData[Key]) => void
}

export const DefaultChatFeatureForm: FunctionComponent<DefaultChatFeatureFormProps> = observer(({
    formValues,
    name,
    setFormValue
}) => {
    const {l} = useLocalization();

    return (
        <Fragment>
            <Typography>
                <b>
                    {name}
                </b>
            </Typography>
            <FormControlLabel control={
                <Checkbox checked={formValues.enabled}
                          onChange={event => setFormValue("enabled", event.target.checked)}
                />
            }
                              label={l("common.enabled")}
            />
        </Fragment>
    );
});