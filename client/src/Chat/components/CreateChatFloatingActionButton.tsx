import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, Fab, makeStyles, Theme, Tooltip} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {useLocalization, useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
    createChatFloatingActionButton: {
        position: "absolute",
        bottom: theme.spacing(2),
        right: theme.spacing(2)
    }
}));

export const CreateChatFloatingActionButton: FunctionComponent = observer(() => {
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
                 color="primary"
            >
                <AddIcon/>
            </Fab>
        </Tooltip>
    )
});
