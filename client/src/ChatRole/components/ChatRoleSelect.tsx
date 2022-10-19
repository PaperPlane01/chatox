import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Select, FormControl, InputLabel, MenuItem, CircularProgress} from "@mui/material";
import {isStandardChatRole, StandardChatRole} from "../../api/types/response";
import {useLocalization, useStore} from "../../store";
import {Labels} from "../../localization";

interface ChatRoleSelectProps {
    onSelect: (roleId: string) => void,
    value?: string,
    label: string,
    rolesIds: string[],
    pending: boolean
}

export const ChatRoleSelect: FunctionComponent<ChatRoleSelectProps> = observer(({
    onSelect,
    value,
    label,
    rolesIds,
    pending = false
}) => {
    const {
        entities: {
            chatRoles: {
                findAllById: findChatRoles
            }
        }
    } = useStore();
    const {l} = useLocalization();
    const roles = findChatRoles(rolesIds);

    return (
        <FormControl fullWidth>
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
                        {isStandardChatRole(role.name)
                            ? l(`chat.participant.role.${role.name as keyof typeof StandardChatRole}` as keyof Labels)
                            : role.name
                        }
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
});
