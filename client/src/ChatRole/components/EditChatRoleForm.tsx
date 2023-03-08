import React, {FunctionComponent, Fragment} from "react";
import {observer} from "mobx-react";
import {TextField, Typography, FormControlLabel, Switch} from "@mui/material";
import {ChatRoleFeatureForms} from "./ChatRoleFeatureForms";
import {ChatRoleSelect} from "./ChatRoleSelect";
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
            error,
            requireDefaultRole,
            defaultRoleError,
            defaultRoleId,
            setFormValue,
            roleId,
            setDefaultRoleId
        },
        entities: {
            chatRoles: {
                findAllByChat: findChatRoles,
                findById: findChatRole
            }
        }
    } = useStore();
    const {l} = useLocalization();

    if (!roleId) {
        return null;
    }

    const role = findChatRole(roleId);

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
            <FormControlLabel control={
                <Switch checked={formValues.default}
                        onChange={event => setFormValue("default", event.target.checked)}
                />
            }
                              label={l("chat.role.default-for-new-participants")}
            />
            {requireDefaultRole && (
                <ChatRoleSelect onSelect={setDefaultRoleId}
                                label={l("chat.role.default-role.replacement")}
                                rolesIds={findChatRoles(role.chatId).map(role => role.id)}
                                pending={false}
                                validationError={defaultRoleError && l(defaultRoleError)}
                                value={defaultRoleId}
                />
            )}
            <ChatRoleFeatureForms/>
            {error && (
                <Typography style={{color: "red"}}>
                    {getErrorText(error, l)}
                </Typography>
            )}
        </Fragment>
    );
});
