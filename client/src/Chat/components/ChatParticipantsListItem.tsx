import React, {FunctionComponent} from "react";
import {inject, observer} from "mobx-react";
import {createStyles, ListItemText, makeStyles, MenuItem, Theme, Typography} from "@material-ui/core";
import randomColor from "randomcolor";
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
    onClick?: () => void
}

type ChatParticipantsListItemProps = ChatParticipantsListItemMobxProps & ChatParticipantsListItemOwnProps;

const useStyles = makeStyles((theme: Theme) => createStyles({
    gutters: {
        paddingLeft: 0
    },
    avatar: {
        paddingRight: theme.spacing(2)
    }
}));

const _ChatParticipantsListItem: FunctionComponent<ChatParticipantsListItemProps> = ({
    participantId,
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
                        avatarUri={user.avatarUri}
                />
            </div>
            <ListItemText>
                {user.firstName} {user.lastName && user.lastName}
            </ListItemText>
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