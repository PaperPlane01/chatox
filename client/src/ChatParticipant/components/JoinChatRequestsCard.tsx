import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Card, CardActions, CardContent, CardHeader, CircularProgress, Theme, Typography} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {JoinChatRequestsList} from "./JoinChatRequestsList";
import {ApproveSelectedJoinChatRequestsButton} from "./ApproveSelectedJoinChatRequestsButton";
import {RejectSelectedJoinChatRequestsButton} from "./RejectSelectedJoinChatRequestsButton";
import {useLocalization, useStore} from "../../store";
import {commonStyles} from "../../style";

const useClasses = makeStyles((theme: Theme) => createStyles({
    cardActions: {
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: theme.spacing(2)
    },
    selectedRequestsActions: {
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: theme.spacing(1)
    }
}));

export const JoinChatRequestsCard: FunctionComponent = observer(() => {
    const {
        joinChatRequests: {
            paginationState: {
                pending
            },
            joinChatRequestsIds,
            selectedJoinChatRequestsIds,
            error,
            fetchJoinChatRequests
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useClasses();

    return (
        <Card>
            <CardHeader title={l("chat.join.requests")}/>
            <CardContent>
                <JoinChatRequestsList/>
                {pending && <CircularProgress size={25} color="primary" style={commonStyles.centered}/>}
                {joinChatRequestsIds.length === 0 && !pending && !error && (
                    <Typography color="textSecondary"
                                style={commonStyles.centered}
                    >
                        {l("chat.join.requests.empty")}
                    </Typography>
                )}
            </CardContent>
            <CardActions className={classes.cardActions}>
                {selectedJoinChatRequestsIds.length !== 0 && (
                    <div className={classes.selectedRequestsActions}>
                        <Typography>
                            <strong>
                                {l("common.selected.count", {count: selectedJoinChatRequestsIds.length})}
                            </strong>
                        </Typography>
                        <ApproveSelectedJoinChatRequestsButton/>
                        <RejectSelectedJoinChatRequestsButton/>
                    </div>
                )}
               <Button color="primary"
                       variant="outlined"
                       disabled={pending}
                       onClick={fetchJoinChatRequests}
               >
                   {pending && <CircularProgress size={15} color="primary"/>}
                   {l("common.load-more")}
               </Button>
            </CardActions>
        </Card>
    );
});
