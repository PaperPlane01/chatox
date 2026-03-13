import React, {FunctionComponent} from "react";
import {observer} from "mobx-react";
import {Link} from "mobx-router";
import {Checkbox, ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {makeStyles} from 'tss-react/mui';
import randomColor from "randomcolor";
import {JoinChatRequestMenu} from "./JoinChatRequestMenu";
import {Avatar} from "../../Avatar";
import {useRouter, useStore} from "../../store";
import {useEntityById} from "../../entities";
import {Routes} from "../../router";
import {getUserAvatarLabel, getUserDisplayedName} from "../../User/utils/labels";
import {commonStyles} from "../../style";
import {useLuminosity} from "../../utils/hooks";

interface JoinChatRequestsListItemProps {
    pendingChatParticipantId: string
}

const useStyles = makeStyles()(() => ({
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
    const router = useRouter();
    const {classes} = useStyles();

    const pendingChatParticipant = useEntityById("pendingChatParticipations", pendingChatParticipantId);
    const user = useEntityById("users", pendingChatParticipant.userId);
    const luminosity = useLuminosity();
    const avatarColor = randomColor({seed: user.id, luminosity});
    const avatarLetter = getUserAvatarLabel(user);
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
