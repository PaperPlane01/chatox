import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, ListItemText, makeStyles, MenuItem, Theme} from "@material-ui/core";
import randomColor from "randomcolor";
import {ChatParticipantMenu} from "./ChatParticipantMenu";
import {ChatParticipationEntity} from "../types";
import {Avatar} from "../../Avatar";
import {UserEntity} from "../../User";
import {MapMobxToProps} from "../../store";

interface ChatParticipantsListItemMobxProps {
    findParticipant: (id: string) => ChatParticipationEntity,
    findUser: (id: string) => UserEntity
}

interface ChatParticipantsListItemOwnProps {
    participantId: string,
    highlightOnline?: boolean,
    onClick?: () => void
}

type ChatParticipantsListItemProps = ChatParticipantsListItemMobxProps & ChatParticipantsListItemOwnProps;

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

const _ChatParticipantsListItem: FunctionComponent<ChatParticipantsListItemProps> = ({
    participantId,
    highlightOnline = false,
    findUser,
    findParticipant,
    onClick
}) => {
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
};

const mapMobxToProps: MapMobxToProps<ChatParticipantsListItemMobxProps> = ({entities}) => ({
    findParticipant: entities.chatParticipations.findById,
    findUser: entities.users.findById
});

export const ChatParticipantsListItem = inject(mapMobxToProps)(
    observer(_ChatParticipantsListItem) as FunctionComponent<ChatParticipantsListItemOwnProps>
);
