import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Button} from "@mui/material";
import {useStore, useLocalization} from "../../store";

export const LinkEmailButton: FunctionComponent = observer(() => {
    const {
        emailUpdate: {
            initialize
        }
    } = useStore();
    const {l} = useLocalization();

    return (
        <Button variant="text"
                color="primary"
                onClick={initialize}
        >
            {l("email.link")}
        </Button>
    );
});