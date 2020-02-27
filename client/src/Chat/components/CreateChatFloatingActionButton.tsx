import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, Fab, makeStyles, Theme, Tooltip} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import {localized, Localized} from "../../localization/components";
import {MapMobxToProps} from "../../store";

interface CreateChatFloatingActionButtonMobxProps {
    setCreateChatDialogOpen: (createChatDialogOpen: boolean) => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
    createChatFloatingActionButton: {
        position: "fixed",
        bottom: theme.spacing(2),
        right: theme.spacing(2)
    }
}));

type CreateChatFloatingActionButtonProps = CreateChatFloatingActionButtonMobxProps & Localized;

const _CreateChatFloatingActionButton: FunctionComponent<CreateChatFloatingActionButtonProps> = ({
    setCreateChatDialogOpen,
    l
}) => {
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
};

const mapMobxToProps: MapMobxToProps<CreateChatFloatingActionButtonMobxProps> = ({chatCreation}) => ({
    setCreateChatDialogOpen: chatCreation.setCreateChatDialogOpen
});

export const CreateChatFloatingActionButton = localized(
    inject(mapMobxToProps)(observer(_CreateChatFloatingActionButton))
) as FunctionComponent;
