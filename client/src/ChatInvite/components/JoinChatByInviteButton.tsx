import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress} from "@mui/material";
import {useLocalization, useStore} from "../../store";
import {commonStyles} from "../../style";

export const JoinChatByInviteButton: FunctionComponent = observer(() => {
    const {
        joinChatByInvite: {
            pending,
            joinChat
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Button variant="contained"
                color="primary"
                disabled={pending}
                onClick={joinChat}
                style={commonStyles.centered}
        >
            {pending && <CircularProgress size={15} color="primary"/>}
            {l("chat.join")}
        </Button>
    );
});
