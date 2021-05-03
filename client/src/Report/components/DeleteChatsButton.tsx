import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {BottomNavigationAction, CircularProgress, Tooltip} from "@material-ui/core";
import {Delete} from "@material-ui/icons";
import {useLocalization} from "../../store/hooks";

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
