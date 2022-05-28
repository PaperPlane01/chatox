import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction, Tooltip} from "@mui/material";
import {Delete} from "@mui/icons-material";
import {useLocalization} from "../../store";

export const DeleteChatsButton: FunctionComponent = observer(() => {
    const {l} = useLocalization();

    return (
        <Tooltip title={l("feature.not-available")}>
            <div>
                <BottomNavigationAction icon={<Delete/>}
                                        label={l("report.chat.action.delete-chats")}
                                        showLabel
                                        disabled
                />
            </div>
        </Tooltip>
    );
});
