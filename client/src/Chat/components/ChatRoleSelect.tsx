import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Select, FormControl, InputLabel, MenuItem} from "@mui/material";
import {ChatRole} from "../../api/types/response";
import {useLocalization} from "../../store";
import {Labels} from "../../localization";

interface ChatRoleSelectProps {
    onSelect: (chatRole: ChatRole) => void,
    value?: ChatRole,
    label: string
}

export const ChatRoleSelect: FunctionComponent<ChatRoleSelectProps> = observer(({
    onSelect,
    value,
    label
}) => {
    const {l} = useLocalization();

    return (
        <FormControl fullWidth>
            <InputLabel>
                {label}
            </InputLabel>
            <Select value={value || ""}
                    onChange={event => onSelect(event.target.value as ChatRole)}
            >
                {Object.keys(ChatRole).map(key => (
                    <MenuItem value={ChatRole[key as keyof typeof ChatRole]}
                              key={key}
                    >
                        {l(`chat.participant.role.${ChatRole[key as keyof typeof ChatRole]}` as keyof Labels)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
});
