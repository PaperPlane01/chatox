import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Fab, Theme, Tooltip} from "@mui/material";
import {Add} from "@mui/icons-material";
import {makeStyles} from "tss-react/mui";
import {useLocalization, useStore} from "../../store";

const useStyles = makeStyles()((theme: Theme) => ({
    createChatFloatingActionButton: {
        position: "fixed",
        bottom: theme.spacing(2),
        right: theme.spacing(2)
    }
}));

interface CreateChatFloatingActionButtonProps {
    bottom?: number,
    right?: number
}

export const CreateChatFloatingActionButton: FunctionComponent<CreateChatFloatingActionButtonProps> = observer(({
    bottom,
    right
}) => {
    const {
        chatCreation: {
            setCreateChatDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();
    const {classes} = useStyles();

    return (
        <Tooltip title={l("chat.create-chat")}>
            <Fab onClick={() => setCreateChatDialogOpen(true)}
                 className={classes.createChatFloatingActionButton}
                 style={{
                     bottom,
                     right
                 }}
                 color="primary"
            >
                <Add/>
            </Fab>
        </Tooltip>
    );
});
