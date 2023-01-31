import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {IconButton} from "@mui/material";
import {Edit} from "@mui/icons-material";
import {useStore} from "../../store";

export const UpdateEmailButton: FunctionComponent = observer(() => {
    const {
        emailUpdate: {
            initialize
        }
    } = useStore();

    return (
        <IconButton onClick={initialize}>
            <Edit/>
        </IconButton>
    );
});
