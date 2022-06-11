import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {FormControl, InputLabel, MenuItem, Select} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {ChatDeletionReason} from "../../api/types/response";
import {Labels} from "../../localization";

export const ChatDeletionReasonSelect: FunctionComponent = observer(() => {
    const {
        chatDeletion: {
            deleteChatForm,
            setFormValue
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <FormControl fullWidth>
            <InputLabel>
                {l("chat.delete.reason")}
            </InputLabel>
            <Select value={deleteChatForm.reason}
                    onChange={event => setFormValue("reason", event.target.value as ChatDeletionReason)}
            >
                {Object.keys(ChatDeletionReason).map(key => (
                    <MenuItem value={ChatDeletionReason[key as keyof typeof ChatDeletionReason]}>
                        {l(`chat.delete.reason.${ChatDeletionReason[key as keyof typeof ChatDeletionReason]}` as keyof Labels)}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
});
