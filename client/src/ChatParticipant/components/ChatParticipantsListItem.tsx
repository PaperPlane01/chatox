import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItemText, MenuItem, Theme} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {ChatParticipantMenu} from "./ChatParticipantMenu";
import {Avatar} from "../../Avatar";
import {useEntityById} from "../../entities";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {useLuminosity} from "../../utils/hooks";

interface ChatParticipantsListItemProps {
    participantId: string,
    highlightOnline?: boolean,
    onClick?: () => void
}

const useStyles = makeStyles((theme: Theme) => createStyles({
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
    onClick
}) => {
    const classes = useStyles();
    const chatParticipant = useEntityById("chatParticipations", participantId);
    const user = useEntityById("users", chatParticipant.userId);
    const luminosity = useLuminosity();
    const avatarLetters = getUserAvatarLabel(user);

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
                <Avatar avatarLetter={avatarLetters}
                        avatarColor={randomColor({seed: user.id, luminosity})}
                        avatarId={user.avatarId}
                        avatarUri={user.externalAvatarUri}
                />
            </div>
            <ListItemText primaryTypographyProps={{
                color: (user.online && highlightOnline) ? "primary" : "textPrimary"
            }}>
                {getUserDisplayedName(user)}
            </ListItemText>
            <ChatParticipantMenu chatParticipation={chatParticipant}/>
        </MenuItem>
    );
});
