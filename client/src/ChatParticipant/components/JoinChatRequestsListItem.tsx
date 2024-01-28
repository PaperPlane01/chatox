import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Link} from "mobx-router";
import {Checkbox, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {createStyles, makeStyles} from "@mui/styles";
import randomColor from "randomcolor";
import {JoinChatRequestMenu} from "./JoinChatRequestMenu";
import {Avatar} from "../../Avatar";
import {useEntities, useRouter, useStore} from "../../store";
import {Routes} from "../../router";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {commonStyles} from "../../style";

interface JoinChatRequestsListItemProps {
    pendingChatParticipantId: string
}

const useStyles = makeStyles(() => createStyles({
    userLink: {
        ...commonStyles.undecoratedLink,
        display: "flex",
        width: "100%",
        alignItems: "center"
    }
}));

export const JoinChatRequestListItem: FunctionComponent<JoinChatRequestsListItemProps> = observer(({
    pendingChatParticipantId
}) => {
    const {
        joinChatRequests: {
            selectRequest,
            unselectRequest,
            isSelected
        }
    } = useStore();
    const {
        pendingChatParticipations: {
            findById: findPendingChatParticipant
        },
        users: {
            findById: findUser
        }
    } = useEntities();
    const router = useRouter();
    const classes = useStyles();

    const pendingChatParticipant = findPendingChatParticipant(pendingChatParticipantId);
    const user = findUser(pendingChatParticipant.userId);
    const avatarLetter = getUserAvatarLabel(user);
    const avatarColor = randomColor({seed: user.id, luminosity: "dark"});
    const selected = isSelected(pendingChatParticipantId);

    const handleCheckboxChange = (): void => {
        if (!selected) {
            selectRequest(pendingChatParticipantId);
        } else {
            unselectRequest(pendingChatParticipantId);
        }
    };

    return (
        <ListItem>
            <Checkbox checked={selected}
                      onChange={handleCheckboxChange}
            />
            <Link route={Routes.userPage}
                  router={router}
                  params={{slug: user.slug ?? user.id}}
                  className={classes.userLink}
            >
                <ListItemAvatar>
                    <Avatar avatarLetter={avatarLetter} avatarColor={avatarColor}/>
                </ListItemAvatar>
                <ListItemText>
                    {getUserDisplayedName(user)}
                </ListItemText>
            </Link>
            <JoinChatRequestMenu requestId={pendingChatParticipantId}/>
        </ListItem>
    );
});
