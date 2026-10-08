import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemText, MenuItem, Theme} from "@mui/material";
import {makeStyles} from "tss-react/mui";
import {ChatParticipantMenu} from "./ChatParticipantMenu";
import {useEntityById} from "../../entities";
import {getUserDisplayedName} from "../../User/utils/labels";
import {UserAvatar} from "../../UserAvatar/components";

interface ChatParticipantsListItemProps {
    participantId: string,
    highlightOnline?: boolean,
    hideMenu?: boolean,
    onClick?: () => void,
}

const useStyles = makeStyles()((theme: Theme) => ({
    gutters: {
        paddingLeft: 0
    },
    avatar: {
        paddingRight: theme.spacing(2)
    }
}));

export const ChatParticipantsListItem: FunctionComponent<ChatParticipantsListItemProps> = observer(({
    participantId,
    highlightOnline = false,
    hideMenu = false,
    onClick
}) => {
    const {classes} = useStyles();
    const chatParticipant = useEntityById("chatParticipations", participantId);
    const user = useEntityById("users", chatParticipant.userId);

    const handleClick = () => {
        if (onClick) {
            onClick();
        }
    };

    return (
        <MenuItem onClick={handleClick}
                  classes={{
                      gutters: classes.gutters
                  }}
        >
            <div className={classes.avatar}>
                <UserAvatar user={user}/>
            </div>
            <ListItemText slotProps={{
                primary: {
                    color: (user.online && highlightOnline) ? "primary" : "textPrimary"
                }
            }}>
                {getUserDisplayedName(user)}
            </ListItemText>
            {!hideMenu && <ChatParticipantMenu chatParticipation={chatParticipant}/>}
        </MenuItem>
    );
});
