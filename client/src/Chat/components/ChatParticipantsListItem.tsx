import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {createStyles, ListItemText, makeStyles, MenuItem, Theme} from "@material-ui/core";
import randomColor from "randomcolor";
import {ChatParticipantMenu} from "./ChatParticipantMenu";
import {Avatar} from "../../Avatar";
import {useStore} from "../../store";

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
    },
    online: {
    }
}));

export const ChatParticipantsListItem: FunctionComponent<ChatParticipantsListItemProps> = observer(({
    participantId,
    highlightOnline = false,
    onClick
}) => {
    const {
        entities: {
            chatParticipations: {
                findById: findParticipant
            },
            users: {
                findById: findUser
            }
        }
    } = useStore();
    const classes = useStyles();
    const chatParticipant = findParticipant(participantId);
    const user = findUser(chatParticipant.userId);
    const avatarLetters = `${user.firstName[0]}${user.lastName ? user.lastName[0] : ""}`;

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
                        avatarColor={randomColor({seed: user.id})}
                        avatarId={user.avatarId}
                />
            </div>
            <ListItemText primaryTypographyProps={{
                color: (user.online && highlightOnline) ? "primary" : "textPrimary"
            }}>
                {user.firstName} {user.lastName && user.lastName}
            </ListItemText>
            <ChatParticipantMenu chatParticipation={chatParticipant}/>
        </MenuItem>
    )
});
