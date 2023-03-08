import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {TextField} from "@mui/material";
import {DefaultChatFeatureForm} from "./DefaultChatFeatureForm";
import {LevelBasedFeatureFromData} from "../types";
import {useLocalization} from "../../store";
import {FormErrors} from "../../utils/types";

interface LevelBasedFeatureFormProps {
    formValues: LevelBasedFeatureFromData,
    formErrors: FormErrors<LevelBasedFeatureFromData>,
    name: string,
    setFormValue: <Key extends keyof LevelBasedFeatureFromData>(key: Key, value: LevelBasedFeatureFromData[Key]) => void
}

export const LevelBasedChatFeatureForm: FunctionComponent<LevelBasedFeatureFormProps> = observer(({
    formValues,
    formErrors,
    name,
    setFormValue
}) => {
    const {l} = useLocalization();

    return (
        <Fragment>
            <DefaultChatFeatureForm formValues={formValues} name={name} setFormValue={setFormValue}/>
            <TextField variant="outlined"
                       color="primary"
                       fullWidth
                       margin="dense"
                       label={l("chat.feature.additional.fromLevel")}
                       value={formValues.fromLevel}
                       onChange={event => setFormValue("fromLevel", event.target.value)}
                       error={Boolean(formErrors.fromLevel)}
                       helperText={formErrors.fromLevel && l(formErrors.fromLevel)}
            />
            <TextField variant="outlined"
                       color="primary"
                       fullWidth
                       margin="dense"
                       label={l("chat.feature.additional.upToLevel")}
                       value={formValues.upToLeveL}
                       onChange={event => setFormValue("upToLeveL", event.target.value)}
                       error={Boolean(formErrors.upToLeveL)}
                       helperText={formErrors.upToLeveL && l(formErrors.upToLeveL)}
            />
        </Fragment>
    );
});