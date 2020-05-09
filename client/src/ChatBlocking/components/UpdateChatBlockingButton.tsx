import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {IconButton, Tooltip} from "@material-ui/core";
import {Edit} from "@material-ui/icons";
import {localized, Localized} from "../../localization";
import {MapMobxToProps} from "../../store";

interface UpdateChatBlockingButtonMobxProps {
    setUpdatedChatBlockingId: (chatBlockingId: string) => void,
    setUpdateChatBlockingDialogOpen: (updateChatBlockingDialogOpen: boolean) => void
}

interface UpdateChatBlockingButtonOwnProps {
    chatBlockingId: string
}

type UpdateChatBlockingButtonProps = UpdateChatBlockingButtonMobxProps & UpdateChatBlockingButtonOwnProps
    & Localized;

const _UpdateChatBlockingButton: FunctionComponent<UpdateChatBlockingButtonProps> = ({
    chatBlockingId,
    setUpdateChatBlockingDialogOpen,
    setUpdatedChatBlockingId,
    l
}) => {
    const handleClick = (): void => {
        setUpdatedChatBlockingId(chatBlockingId);
        setUpdateChatBlockingDialogOpen(true);
    };

    return (
        <Tooltip title={l("chat.blocking.edit")}>
            <IconButton onClick={handleClick}>
                <Edit/>
            </IconButton>
        </Tooltip>
    )
};

const mapMobxToProps: MapMobxToProps<UpdateChatBlockingButtonMobxProps> = ({updateChatBlocking}) => ({
    setUpdatedChatBlockingId: updateChatBlocking.setChatBlocking,
    setUpdateChatBlockingDialogOpen: updateChatBlocking.setUpdateChatBlockingDialogOpen
});

export const UpdateChatBlockingButton = localized(
    inject(mapMobxToProps)(observer(_UpdateChatBlockingButton))
) as FunctionComponent<UpdateChatBlockingButtonOwnProps>;
