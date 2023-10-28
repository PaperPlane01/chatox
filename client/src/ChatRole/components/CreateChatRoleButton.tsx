import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button, Icon, Theme} from "@mui/material";
import {Add} from "@mui/icons-material";
import {createStyles, makeStyles} from "@mui/styles";
import {useLocalization, useStore} from "../../store";

const useStyles = makeStyles((theme: Theme) => createStyles({
    createChatRoleButton: {
        width: "100%",
        justifyContent: "left",
        lineHeight: 0,
        textTransform: "none"
    },
    createChatRoleIcon: {
        paddingRight: theme.spacing(4)
    }
}));

export const CreateChatRoleButton: FunctionComponent = observer(() => {
    const {
        createChatRole: {
            setCreateChatRoleDialogOpen
        }
    } = useStore();
    const {l} = useLocalization();
    const classes = useStyles();

    const handleClick = (): void => {
        setCreateChatRoleDialogOpen(true);
    };

    return (
        <Button variant="text"
                className={classes.createChatRoleButton}
                onClick={handleClick}
        >
            <Icon color="primary"
                  className={classes.createChatRoleIcon}
            >
                <Add/>
            </Icon>
            {l("chat.role.create")}
        </Button>
    );
});
