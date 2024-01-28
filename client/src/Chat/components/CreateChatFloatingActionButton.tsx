import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Fab, Theme, Tooltip} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import {Add} from "@mui/icons-material";
import {useLocalization, useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
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
    const classes = useStyles();

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
