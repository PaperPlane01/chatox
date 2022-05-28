import React, {FunctionComponent, useEffect} from "react";
import {observer} from "mobx-react";
import {MenuItem, ListItemIcon, ListItemText} from "@mui/material";
import {HighlightOff} from "@mui/icons-material";
import {useSnackbar} from "notistack";
import {useLocalization, useStore} from "../../store";

interface KickChatParticipantMenuItemProps {
    chatParticipationId: string,
    onClick?: () => void
}

export const KickChatParticipantMenuItem: FunctionComponent<KickChatParticipantMenuItemProps> = observer(({
    chatParticipationId,
    onClick
}) => {
    const {
        kickFromChat: {
            kickChatParticipant,
            error,
            showSnackbar,
            setShowSnackbar
        }
    } = useStore();
    const {l} = useLocalization();
    const {enqueueSnackbar} = useSnackbar();

    useEffect(
        () => {
            if (showSnackbar) {
                if (error) {
                    enqueueSnackbar(l("chat.participant.kick.error"), {variant: "error"});
                } else {
                    enqueueSnackbar(l("chat.participant.kick.success"));
                }

                setShowSnackbar(false);
            }
        }
    );

    const handleClick = (): void => {
        if (onClick) {
            onClick();
        }

        kickChatParticipant(chatParticipationId);
    };

    return (
        <MenuItem onClick={handleClick}>
            <ListItemIcon>
                <HighlightOff/>
            </ListItemIcon>
            <ListItemText>
                {l("chat.participant.kick")}
            </ListItemText>
        </MenuItem>
    );
});
