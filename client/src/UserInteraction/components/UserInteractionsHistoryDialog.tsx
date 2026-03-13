import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, CircularProgress, Dialog, DialogContent, DialogTitle, IconButton, Typography} from "@mui/material";
import {Close} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {UserInteractionsHistoryTable} from "./UserInteractionsHistoryTable";
import {commonStyles} from "../../style";
import {useLocalization, useStore} from "../../store";
import {useMobileDialog} from "../../utils/hooks";

const useStyles = makeStyles()(() => ({
    centered: commonStyles.centered,
}));

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
    const {classes} = useStyles();

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
                    <UserInteractionsHistoryTable/>
                )}
                {pending && <CircularProgress size={25} color="primary" className={classes.centered}/>}
                {!pending && userInteractionsIds.length === 0 && (
                    <Typography variant="h6"
                                color="textSecondary"
                                className={classes.centered}
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