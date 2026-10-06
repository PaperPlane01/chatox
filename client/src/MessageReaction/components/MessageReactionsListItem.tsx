import React, {Fragment, FunctionComponent} from "react";
import {observer} from "mobx-react";
import {ListItem, ListItemAvatar, ListItemText} from "@mui/material";
import {MessageReactionEntity} from "../types";
import {useEntityById} from "../../entities";
import {useLocalization} from "../../store/hooks";
import {getCreatedAtLabel} from "../../utils/date-utils";
import {UserLink} from "../../UserLink/components";
import {useSelectedEmojiSet} from "../../Emoji/hooks";
import {UserAvatar} from "../../UserAvatar/components";

interface MessageReactionsListItemProps {
    messageReaction: MessageReactionEntity,
    onClick?: () => void
}

export const MessageReactionsListItem: FunctionComponent<MessageReactionsListItemProps> = observer(({
    messageReaction,
    onClick
}) => {
    const user = useEntityById("users", messageReaction.userId);
    const emojiSet = useSelectedEmojiSet();
    const {dateFnsLocale} = useLocalization();

    return (
        <ListItem>
            <ListItemAvatar>
                <UserAvatar user={user}/>
            </ListItemAvatar>
            <ListItemText
                primary={<UserLink user={user} onClick={onClick}/>}
                secondary={
                    <Fragment>
                        <em-emoji id={messageReaction.emojiId} size="20" set={emojiSet}></em-emoji>
                        {" "}
                        {getCreatedAtLabel(messageReaction.createdAt, dateFnsLocale)}
                    </Fragment>
                }
            />
        </ListItem>
    );
});
