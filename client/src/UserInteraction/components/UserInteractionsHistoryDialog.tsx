import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Typography} from "@mui/material";
import {Close} from "@mui/icons-material";
import {UserInteractionHistoryTable} from "./UserInteractionHistoryTable";
import {commonStyles} from "../../style";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

export const UserInteractionsHistoryDialog: FunctionComponent = observer(() => {
    const {
        userInteractionsHistory: {
            userInteractionsHistoryDialogOpen,
            setUserInteractionsHistoryDialogOpen,
            pending,
            fetchUserInteractionsHistory,
            userInteractionsIds
        }
    } = useStore();
    const {l} = useLocalization();
    const {fullScreen} = useMobileDialog();

    return (
        <Dialog open={userInteractionsHistoryDialogOpen}
                onClose={() => setUserInteractionsHistoryDialogOpen(false)}
                fullWidth
                maxWidth="md"
                fullScreen={fullScreen}
        >
            <DialogTitle>
                {l("user.interaction.list")}
                <IconButton style={{float: "right"}}
                            onClick={() => setUserInteractionsHistoryDialogOpen(false)}
                >
                    <Close/>
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {userInteractionsIds.length !== 0 && (
                    <UserInteractionHistoryTable/>
                )}
                {pending && <CircularProgress size={25} color="primary" style={commonStyles.centered}/>}
                {!pending && userInteractionsIds.length === 0 && (
                    <Typography variant="h6"
                                color="textSecondary"
                                style={commonStyles.centered}
                    >
                        {l("user.interaction.list.empty")}
                    </Typography>
                )}
                {userInteractionsIds.length !== 0 && (
                    <Button variant="outlined"
                            color="primary"
                            onClick={fetchUserInteractionsHistory}
                            disabled={pending}
                    >
                        {l("common.load-more")}
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    );
});