import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button} from "@mui/material";
import {Add} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const CreateChatInviteButton: FunctionComponent = observer(() => {
    const {
        chatInviteCreation: {
            setCreateChatInviteDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Button onClick={() => setCreateChatInviteDialogOpen(true)}>
            <Add/>
            {l("common.create")}
        </Button>
    );
});
