import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {TextField, Typography} from "@mui/material";
import {ChatRoleFeatureForms} from "./ChatRoleFeatureForms";
import {useLocalization, useStore} from "../../store";
import {API_UNREACHABLE_STATUS, ApiError} from "../../api";
import {TranslationFunction} from "../../localization";

const getErrorText = (error: ApiError, l: TranslationFunction): string => {
    if (error.status === API_UNREACHABLE_STATUS) {
        return l("common.error.server-unreachable");
    }

    return l("chat.role.update.error.unknown", {errorStatus: error.status});
}

export const EditChatRoleForm: FunctionComponent = observer(() => {
    const {
        editChatRole: {
            formValues,
            formErrors,
            pending,
            error,
            setFormValue
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Fragment>
            <TextField label={l("chat.role.name")}
                       value={formValues.name}
                       onChange={event => setFormValue("name", event.target.value)}
                       error={Boolean(formErrors.name)}
                       helperText={formErrors.name && l(formErrors.name)}
                       margin="dense"
                       fullWidth
                       variant="outlined"
            />
            <TextField label={l("chat.role.level")}
                       value={formValues.level}
                       onChange={event => setFormValue("level", event.target.value)}
                       error={Boolean(formErrors.level)}
                       helperText={formErrors.level && l(formErrors.level)}
                       margin="dense"
                       fullWidth
                       variant="outlined"
            />
            <ChatRoleFeatureForms/>
            {error && (
                <Typography style={{color: "red"}}>
                    {getErrorText(error, l)}
                </Typography>
            )}
        </Fragment>
    );
});
