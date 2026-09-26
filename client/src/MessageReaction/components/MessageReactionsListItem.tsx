import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {MessageReactionEntity} from "../types";
import {Avatar} from "../../Avatar";
import {getUserAvatarLabel} from "../../User/utils/labels";
import {useEntityById} from "../../entities";
import {useLocalization} from "../../store";
import {useRandomColor} from "../../utils/hooks";
import {getCreatedAtLabel} from "../../utils/date-utils";
import {UserLink} from "../../UserLink";
import {useSelectedEmojiSet} from "../../Emoji/hooks";

interface MessageReactionsListItemProps {
    messageReaction: MessageReactionEntity,
    onClick?: () => void
}

export const MessageReactionsListItem: FunctionComponent<MessageReactionsListItemProps> = observer(({
    messageReaction,
    onClick
}) => {
    const user = useEntityById("users", messageReaction.userId);
    const avatarColor = useRandomColor(user.id);
    const avatarLabel = getUserAvatarLabel(user);
    const emojiSet = useSelectedEmojiSet();
    const {dateFnsLocale} = useLocalization();

    return (
        <ListItem>
            <ListItemAvatar>
                <Avatar
                    avatarLetter={avatarLabel}
                    avatarColor={avatarColor}
                    avatarId={user.avatarId}
                />
            </ListItemAvatar>
            <ListItemText
                primary={<UserLink user={user} onClick={onClick}/>}
                secondary={(
                    <Fragment>
                        <em-emoji id={messageReaction.emojiId} size="20" set={emojiSet}></em-emoji>
                        {" "}
                        {getCreatedAtLabel(messageReaction.createdAt, dateFnsLocale)}
                    </Fragment>
                )}
            />
        </ListItem>
    );
});
