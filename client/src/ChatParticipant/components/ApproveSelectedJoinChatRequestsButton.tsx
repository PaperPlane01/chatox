import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress} from "@mui/material";
import {CheckCircle} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

export const ApproveSelectedJoinChatRequestsButton: FunctionComponent = observer(() => {
    const {
        joinChatRequestsApproval: {
            pending,
            approvalsPending,
            approveSelectedJoinChatRequests
        },
        joinChatRequestsRejection: {
            pending: rejectionPending,
            rejectionsPending
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Button variant="contained"
                color="primary"
                disabled={pending || approvalsPending || rejectionPending || rejectionsPending}
                onClick={approveSelectedJoinChatRequests}
        >
            {pending && <CircularProgress size={15} color="primary"/>}
            <CheckCircle/>
            {l("chat.join.request.approve")}
        </Button>
    );
});
