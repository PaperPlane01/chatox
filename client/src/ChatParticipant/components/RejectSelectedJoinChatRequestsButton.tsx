import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress} from "@mui/material";
import {Cancel} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const RejectSelectedJoinChatRequestsButton: FunctionComponent = observer(() => {
    const {
        joinChatRequestsRejection: {
            pending,
            rejectionsPending,
            rejectSelectedJoinChatRequests
        },
        joinChatRequestsApproval: {
            pending: approvalPending,
            approvalsPending
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Button variant="contained"
                color="primary"
                disabled={pending || rejectionsPending || approvalPending || approvalsPending}
                onClick={rejectSelectedJoinChatRequests}
        >
            {pending && <CircularProgress size={15} color="primary"/>}
            <Cancel/>
            {l("chat.join.request.reject")}
        </Button>
    );
});
