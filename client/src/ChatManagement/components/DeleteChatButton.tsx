import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";
import {ChatDeletionStep} from "../../Chat";

export const DeleteChatButton: FunctionComponent = observer(() => {
    const {
        chatDeletion: {
            setCurrentStep
        }
    } = useStore();
    const {l} = useLocalization();

    const handleClick = (): void => {
        setCurrentStep(ChatDeletionStep.CONFIRM_CHAT_DELETION);
    };

    return (
        <Button onClick={handleClick}
                variant="contained"
                color="primary"
        >
            <Delete/>
            {l("chat.delete")}
        </Button>
    );
});
