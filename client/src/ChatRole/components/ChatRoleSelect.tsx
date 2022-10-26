import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {CircularProgress, FormControl, FormHelperText, InputLabel, MenuItem, Select} from "@mui/material";
import {getChatRoleTranslation} from "../utils";
import {useLocalization, useStore} from "../../store";

interface ChatRoleSelectProps {
    onSelect: (roleId: string) => void,
    value?: string,
    label: string,
    rolesIds: string[],
    pending: boolean,
    validationError?: string
}

export const ChatRoleSelect: FunctionComponent<ChatRoleSelectProps> = observer(({
    onSelect,
    value,
    label,
    rolesIds,
    pending = false,
    validationError
}) => {
    const {
        entities: {
            chatRoles: {
                findAllById: findChatRoles
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const roles = findChatRoles(rolesIds).sort((first, second) => first.level - second.level);

    return (
        <FormControl fullWidth
                     error={Boolean(validationError)}
        >
            <InputLabel>
                {label}
            </InputLabel>
            <Select value={value || ""}
                    onChange={event => onSelect(event.target.value as string)}
            >
                {pending && <CircularProgress size={15} color="primary"/>}
                {roles.map(role => (
                    <MenuItem value={role.id}
                              key={role.id}
                    >
                        {getChatRoleTranslation(role.name, l)} ({role.level})
                    </MenuItem>
                ))}
            </Select>
            {validationError && <FormHelperText>{validationError}</FormHelperText>}
        </FormControl>
    );
});
